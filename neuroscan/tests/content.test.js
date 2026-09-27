import { describe, expect, it } from "vitest";
import authored from "../content/challenges.json";
import media from "../content/media.json";
import modules from "../content/modules.json";
import { buildChallenges, unusedMedia, validateContent } from "../src/core/content.js";
import { optionOrder } from "../src/core/shuffle.js";

const clone = (value) => structuredClone(value);

describe("question bank", () => {
  it("is valid", () => {
    expect(validateContent({ modules, challenges: authored, media })).toEqual([]);
  });

  it("covers every module with 98 challenges", () => {
    expect(authored).toHaveLength(98);
    for (let i = 0; i < modules.length; i++) expect(authored.some((c) => c.module === i)).toBe(true);
  });

  it("reports unused images instead of shipping them", () => {
    expect(unusedMedia({ challenges: authored, media })).toEqual(["ct-edema", "ct-hemorrhage", "ct-cervical", "mr-t2-vent", "mr-t1-cervical", "mr-thoracic"]);
  });
});

describe("buildChallenges", () => {
  const built = buildChallenges(authored);

  it("keeps the authored correct option after shuffling", () => {
    for (const [i, c] of built.entries()) {
      expect(c.options[c.answer]).toBe(authored[i].options[authored[i].answer]);
      expect([...c.options].sort()).toEqual([...authored[i].options].sort());
    }
  });

  it("maps display positions back to authored indices", () => {
    for (const [i, c] of built.entries()) c.options.forEach((option, d) => expect(authored[i].options[c.order[d]]).toBe(option));
  });

  // Golden values produced by the original v1 single-file app; saved `choices` depend on them.
  it("matches the v1 option order so existing backups stay valid", () => {
    const golden = [
      // IDs reflect the module-grouped reorder (module 0 = 1-12, module 1 = 13-24, …).
      [1, 2, "El diagnóstico más probable"],
      [2, 2, "Cisternas basales"],
      [7, 2, "Hidrocefalia comunicante"],
      [29, 0, "Desplazamiento de estructuras "],
      [98, 2, "Esperar al informe final para "],
    ];
    for (const [id, answer, firstOption] of golden) {
      const c = built[id - 1];
      expect(c.answer).toBe(answer);
      expect(c.options[0].slice(0, 30)).toBe(firstOption);
    }
  });

  it("produces a deterministic permutation", () => {
    for (let id = 1; id <= 200; id++) {
      const order = optionOrder(id);
      expect([...order].sort()).toEqual([0, 1, 2, 3]);
      expect(optionOrder(id)).toEqual(order);
    }
  });
});

describe("validateContent", () => {
  const base = () => ({ modules: clone(modules), challenges: clone(authored), media: clone(media) });

  it.each([
    ["non-consecutive ids", (c) => (c.challenges[3].id = 99), /consecutivos/],
    ["unknown module", (c) => (c.challenges[0].module = 42), /módulo inexistente/],
    ["three options", (c) => c.challenges[0].options.pop(), /exactamente 4/],
    ["duplicated options", (c) => (c.challenges[0].options[1] = c.challenges[0].options[0]), /repetidas/],
    ["answer out of range", (c) => (c.challenges[0].answer = 4), /índice entre 0 y 3/],
    ["empty explanation", (c) => (c.challenges[0].explanation = "  "), /explanation/],
    ["unknown image", (c) => c.challenges[0].media.push("nope"), /imagen desconocida/],
    ["image listed twice", (c) => c.challenges[0].media.push(c.challenges[0].media[0]), /imagen repetida/],
    ["bad difficulty", (c) => (c.challenges[0].difficulty = "Fácil"), /dificultad/],
    ["media without alt", (c) => (c.media["ct-axial"].alt = ""), /"alt"/],
  ])("rejects %s", (_name, mutate, message) => {
    const content = base();
    mutate(content);
    expect(validateContent(content).join("\n")).toMatch(message);
  });
});
