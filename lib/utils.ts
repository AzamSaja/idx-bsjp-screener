import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIdr(value: number): string {
  if (Math.abs(value) >= 1e12) {
    return `Rp ${(value / 1e12).toFixed(2)} T`;
  }
  if (Math.abs(value) >= 1e9) {
    return `Rp ${(value / 1e9).toFixed(2)} B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `Rp ${(value / 1e6).toFixed(1)} M`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("id-ID");
}

export function formatLots(lots: number): string {
  if (lots >= 1e6) {
    return `${(lots / 1e6).toFixed(2)}M lots`;
  }
  if (lots >= 1e3) {
    return `${(lots / 1e3).toFixed(1)}K lots`;
  }
  return `${lots.toLocaleString("id-ID")} lots`;
}

