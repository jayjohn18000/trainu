// Mock calendar API
export const calendarApi = {
  async getAvailabilityRules(trainerId: string) {
    return [];
  },
  async updateAvailabilityRules(trainerId: string, rules: any[]) {
    return rules;
  },
  async getAvailabilityExceptions(trainerId: string) {
    return [];
  },
  async updateAvailabilityExceptions(trainerId: string, exceptions: any[]) {
    return exceptions;
  },
};
