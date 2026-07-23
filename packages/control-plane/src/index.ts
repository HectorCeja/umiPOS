export const businessTypes = [
  'RETAIL_STORE',
  'RESTAURANT',
  'COFFEE_SHOP',
  'BARBER_SHOP',
  'BEAUTY_SALON',
  'TATTOO_STUDIO',
  'SERVICE_BUSINESS',
  'OTHER',
] as const;
export type BusinessType = (typeof businessTypes)[number];

export const onboardingSteps = ['BUSINESS', 'REGION', 'TEMPLATE', 'REVIEW', 'COMPLETE'] as const;

export type TemplateDefinition = Readonly<{
  key: string;
  name: string;
  businessType: BusinessType;
  version: number;
  features: readonly string[];
  initialSettings: Readonly<Record<string, unknown>>;
  categorySuggestions: readonly string[];
  suggestedPermissions: Readonly<Record<string, readonly string[]>>;
}>;

export function validateTemplate(template: TemplateDefinition): TemplateDefinition {
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(template.key)) throw new Error('Invalid template key');
  if (!businessTypes.includes(template.businessType)) throw new Error('Invalid business type');
  if (!Number.isInteger(template.version) || template.version < 1)
    throw new Error('Invalid template version');
  if (new Set(template.features).size !== template.features.length)
    throw new Error('Duplicate template feature');
  return Object.freeze({ ...template });
}

export type OnboardingState = Readonly<{
  status: 'DRAFT' | 'COMPLETED';
  currentStep: number;
  version: number;
  completedAt?: Date;
}>;

export function advanceOnboarding(state: OnboardingState, nextStep: number): OnboardingState {
  if (state.status !== 'DRAFT') throw new Error('Completed onboarding cannot advance');
  if (!Number.isInteger(nextStep) || nextStep < state.currentStep || nextStep > 5)
    throw new Error('Invalid onboarding step');
  return Object.freeze({ ...state, currentStep: nextStep, version: state.version + 1 });
}

export function completeOnboarding(state: OnboardingState, completedAt: Date): OnboardingState {
  if (state.status !== 'DRAFT' || state.currentStep < 4)
    throw new Error('Onboarding is not ready to complete');
  return Object.freeze({
    completedAt,
    currentStep: 5,
    status: 'COMPLETED',
    version: state.version + 1,
  });
}

export function restartOnboarding(state: OnboardingState): OnboardingState {
  return Object.freeze({ currentStep: 1, status: 'DRAFT', version: state.version + 1 });
}
