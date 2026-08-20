function getRows(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return null;
}

export function detect(payload, previousRunCounts = []) {
  const rows = getRows(payload);

  if (!rows) {
    return {
      isValid: false,
      reason: "Scrape payload does not contain a valid rows array",
    };
  }

  if (rows.length === 0) {
    return {
      isValid: false,
      reason: "Scrape returned zero rows",
    };
  }

  // ---------------------------------------------------------
  // 1. Shape check
  // ---------------------------------------------------------

  const invalidShapeIndex = rows.findIndex((row) => {
    if (!row || typeof row !== "object") {
      return true;
    }

    return (
      !row.item_id ||
      typeof row.primary_value !== "number" ||
      typeof row.status !== "string"
    );
  });

  if (invalidShapeIndex !== -1) {
    const invalidRow = rows[invalidShapeIndex];

    const missingFields = [];

    if (!invalidRow || typeof invalidRow !== "object") {
      missingFields.push("row object");
    } else {
      if (!invalidRow.item_id) {
        missingFields.push("item_id");
      }

      if (typeof invalidRow.primary_value !== "number") {
        missingFields.push("primary_value");
      }

      if (typeof invalidRow.status !== "string") {
        missingFields.push("status");
      }
    }

    const missingPercentage = (
      (rows.filter(
        (row) =>
          !row ||
          typeof row !== "object" ||
          !row.item_id ||
          typeof row.primary_value !== "number" ||
          typeof row.status !== "string"
      ).length /
        rows.length) *
      100
    ).toFixed(1);

    return {
      isValid: false,
      reason: `Invalid row shape: missing or invalid ${missingFields.join(
        ", "
      )} in ${missingPercentage}% of rows`,
    };
  }

  // ---------------------------------------------------------
  // 2. Volume check
  // ---------------------------------------------------------

  const validPreviousCounts = previousRunCounts
    .map(Number)
    .filter((count) => Number.isFinite(count) && count >= 0);

  if (validPreviousCounts.length > 0) {
    const average =
      validPreviousCounts.reduce(
        (sum, count) => sum + count,
        0
      ) / validPreviousCounts.length;

    const threshold = average * 0.6;

    if (rows.length < threshold) {
      const dropPercentage = (
        ((average - rows.length) / average) *
        100
      ).toFixed(1);

      return {
        isValid: false,
        reason: `Row count dropped by ${dropPercentage}%: current ${rows.length}, previous average ${average.toFixed(
          1
        )}`,
      };
    }
  }

  // ---------------------------------------------------------
  // 3. Staleness check
  // ---------------------------------------------------------

  const values = rows.map((row) => row.primary_value);

  const firstValue = values[0];

  const allValuesIdentical = values.every(
    (value) => value === firstValue
  );

  if (allValuesIdentical) {
    return {
      isValid: false,
      reason: `Stale response detected: all ${rows.length} rows have identical primary_value ${firstValue}`,
    };
  }

  // ---------------------------------------------------------
  // Everything passed
  // ---------------------------------------------------------

  return {
    isValid: true,
    reason: null,
  };
}