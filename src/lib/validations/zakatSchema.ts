import { z } from "zod";

const MAX_AMOUNT = 999_999_999_999_999; // 15 chiffres

const positiveNumber = z
  .number({ error: "Entrez un montant valide" })
  .min(0, "Le montant doit être positif ou nul")
  .max(MAX_AMOUNT, "Montant trop élevé");

export { MAX_AMOUNT };

export const step1Schema = z.object({
  cash: positiveNumber,
  accountsReceivable: positiveNumber,
});

export const step2Schema = z.object({
  inventoryValue: positiveNumber,
});

export const step3Schema = z.object({
  accountsPayable: positiveNumber,
  salariesPayable: positiveNumber,
});

export const zakatFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

export type ZakatFormData = z.infer<typeof zakatFormSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

export const STEP_FIELDS: (keyof ZakatFormData)[][] = [
  ["cash", "accountsReceivable"],
  ["inventoryValue"],
  ["accountsPayable", "salariesPayable"],
];
