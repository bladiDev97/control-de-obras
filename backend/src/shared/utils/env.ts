export function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (required && (!value || value.trim() === '')) {
    throw new Error(
      `❌ Environment variable "${key}" is required but was not set.`,
    );
  }

  return value!;
}
