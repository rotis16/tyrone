import type { UnitConversion } from "./types";

/** Converts a conventional-unit value to its SI equivalent using a biomarker's UnitConversion. */
export function toSI(conventionalValue: number, conversion: UnitConversion): number {
  if (conversion.kind === "linear") {
    return conventionalValue * conversion.scale;
  }
  return conventionalValue * conversion.scale + conversion.offset;
}

/** Inverse of toSI — converts an SI value back to the conventional unit. */
export function fromSI(siValue: number, conversion: UnitConversion): number {
  if (conversion.kind === "linear") {
    return siValue / conversion.scale;
  }
  return (siValue - conversion.offset) / conversion.scale;
}

export function linear(scale: number): UnitConversion {
  return { kind: "linear", scale };
}

export function affine(scale: number, offset: number): UnitConversion {
  return { kind: "affine", scale, offset };
}
