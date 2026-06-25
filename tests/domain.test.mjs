import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAlarms, classifyReading, summarizePlant } from "../src/hmi-web/domain.mjs";

const baseReading = {
  id: "forming-press-01",
  tag: "PR-420",
  name: "Forming press",
  area: "Packaging",
  temperatureC: 72,
  pressureBar: 5,
  vibrationMmS: 3.8,
  throughputPerHour: 200,
  utilizationPct: 82,
  isOffline: false,
  updatedAt: "2026-06-25T08:00:00.000Z"
};

describe("HMI domain rules", () => {
  it("classifies normal readings as running", () => {
    assert.equal(classifyReading(baseReading), "running");
  });

  it("classifies high temperature as critical", () => {
    assert.equal(classifyReading({ ...baseReading, temperatureC: 86 }), "critical");
  });

  it("builds an offline alarm", () => {
    const alarms = buildAlarms([{ ...baseReading, isOffline: true }]);

    assert.equal(alarms.length, 1);
    assert.equal(alarms[0].severity, "critical");
    assert.equal(alarms[0].title, "Equipment offline");
  });

  it("summarizes online equipment and active alarms", () => {
    const summary = summarizePlant([
      baseReading,
      { ...baseReading, id: "feed-pump-01", tag: "P-410", pressureBar: 6.3 }
    ]);

    assert.equal(summary.online, 2);
    assert.equal(summary.total, 2);
    assert.equal(summary.activeAlarms, 1);
    assert.equal(summary.throughputTotal, 400);
  });
});
