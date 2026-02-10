const OKLCH_REGEX =
	/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(deg|rad|turn)?\s*(?:\/\s*([0-9.]+))?\s*\)/i;

function clamp01(value: number) {
	return Math.min(1, Math.max(0, value));
}

function linearToSrgb(value: number) {
	return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
}

function hueToDegrees(hue: number, unit?: string) {
	if (unit === 'rad') {
		return (hue * 180) / Math.PI;
	}
	if (unit === 'turn') {
		return hue * 360;
	}
	return hue;
}

export function oklchToRgb(value: string) {
	const match = value.match(OKLCH_REGEX);
	if (!match) {
		return value;
	}

	const l = Number(match[1]);
	const c = Number(match[2]);
	const h = hueToDegrees(Number(match[3]), match[4]);
	const hRad = (h * Math.PI) / 180;

	const a = c * Math.cos(hRad);
	const b = c * Math.sin(hRad);

	const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = l - 0.0894841775 * a - 1.291485548 * b;

	const l3 = l_ ** 3;
	const m3 = m_ ** 3;
	const s3 = s_ ** 3;

	const rLinear = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
	const gLinear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
	const bLinear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

	const r = Math.round(clamp01(linearToSrgb(rLinear)) * 255);
	const g = Math.round(clamp01(linearToSrgb(gLinear)) * 255);
	const bOut = Math.round(clamp01(linearToSrgb(bLinear)) * 255);

	return `rgb(${r}, ${g}, ${bOut})`;
}
