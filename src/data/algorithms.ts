import { getDocstrings } from '@/lib/lang';

export type AlgorithmPreset = {
	id: string;
	code: string;
	name: string;
	description?: string;
};

const raw = [
	{
		id: 'buy-and-hold',
		code: `# Buy & Hold

# Always long.

1`,
	},
	{
		id: 'short-and-hold',
		code: `# Short & Hold

# Always short.

-1`,
	},
	{
		id: 'flat',
		code: `# Flat

# Always flat.

0`,
	},
	{
		id: 'momentum',
		code: `# Momentum

# Follow the last 5-bar price change.

let change = diff price 5 in
change`,
	},
	{
		id: 'return',
		code: `# Return

# Position is 10-bar return.

let prev = lag price 10 in
let change = diff price 10 in
div change prev`,
	},
	{
		id: 'sma',
		code: `# SMA

# Long when fast SMA is above slow SMA.

let fast = mean price 20 in
let slow = mean price 100 in
sub fast slow`,
	},
	{
		id: 'ema',
		code: `# EMA

# Long when fast EMA is above slow EMA.

let fast = ema price 12 in
let slow = ema price 26 in
sub fast slow`,
	},
	{
		id: 'price-vs-sma',
		code: `# Price vs SMA

# Long when price is above its 20-bar SMA.

let avg = mean price 20 in
sub price avg`,
	},
	{
		id: 'price-vs-ema',
		code: `# Price vs EMA

# Long when price is above its 20-bar EMA.

let avg = ema price 20 in
sub price avg`,
	},
	{
		id: 'sma-slope',
		code: `# SMA Slope

# Go with the slope of the 20-bar SMA.

let avg = mean price 20 in
diff avg 5`,
	},
	{
		id: 'ema-slope',
		code: `# EMA Slope

# Go with the slope of the 50-bar EMA.

let avg = ema price 50 in
diff avg 10`,
	},
	{
		id: 'acceleration',
		code: `# Acceleration

# Trade the second derivative of price.

let velocity = diff price 1 in
diff velocity 1`,
	},
	{
		id: 'donchian',
		code: `# Donchian Breakout

# Long on 50-bar high, short on 50-bar low.

let p1 = lag price 1 in
let hi = rolling_max p1 50 in
let lo = rolling_min p1 50 in
let up = gt price hi in
let down = lt price lo in
let down_pos = if down -1 0 in
if up 1 down_pos`,
	},
	{
		id: 'channel-mid',
		code: `# Channel Mid

# Long above the 20-bar channel midpoint.

let p1 = lag price 1 in
let hi = rolling_max p1 20 in
let lo = rolling_min p1 20 in
let mid = hi |> add lo |> mul 0.5 in
price
|> sub mid`,
	},
	{
		id: 'mean-reversion-sma',
		code: `# Mean Reversion SMA

# Fade distance from the 20-bar SMA.

let avg = mean price 20 in
price
|> sub avg
|> neg`,
	},
	{
		id: 'mean-reversion-ema',
		code: `# Mean Reversion EMA

# Fade distance from the 20-bar EMA.

let avg = ema price 20 in
price
|> sub avg
|> neg`,
	},
	{
		id: 'zscore-revert',
		code: `# Z-Score Revert

# Fade the 20-bar z-score.

let z = zscore price 20 in
z
|> div 2
|> neg`,
	},
	{
		id: 'zscore-trend',
		code: `# Z-Score Trend

# Follow the 20-bar z-score.

let z = zscore price 20 in
z
|> div 2`,
	},
	{
		id: 'bollinger-revert',
		code: `# Bollinger Revert

# Short above upper band, long below lower band.

let m = mean price 20 in
let sd = stdev price 20 in
let band = mul sd 2 in
let upper = add m band in
let lower = sub m band in
let above = gt price upper in
let below = lt price lower in
let below_pos = if below 1 0 in
if above -1 below_pos`,
	},
	{
		id: 'vol-scaled-momentum',
		code: `# Vol-Scaled Momentum

# Momentum scaled by recent volatility.

let vol = stdev price 20 in
price
|> diff 5
|> div vol`,
	},
	{
		id: 'high-vol-trend',
		code: `# High-Vol Trend

# Trend only when volatility is high.

let trend = diff price 10 in
let vol = stdev price 20 in
let cond = gt vol 0.01 in
let ok = if cond 1 0 in
mul trend ok`,
	},
	{
		id: 'low-vol-mean-reversion',
		code: `# Low-Vol Mean Reversion

# Mean reversion only when volatility is low.

let move = price |> diff 5 |> neg in
let vol = stdev price 20 in
let cond = lt vol 0.01 in
let ok = if cond 1 0 in
mul move ok`,
	},
	{
		id: 'volume-spike-trend',
		code: `# Volume Spike Trend

# Trend only when volume spikes.

let trend = diff price 5 in
let avg = mean volume 20 in
let spike = gt volume (mul avg 1.5) in
let ok = if spike 1 0 in
mul trend ok`,
	},
	{
		id: 'volume-spike-revert',
		code: `# Volume Spike Revert

# Fade price moves on volume spikes.

let move = price |> diff 1 |> neg in
let avg = mean volume 20 in
let spike = gt volume (mul avg 2) in
let ok = if spike 1 0 in
mul move ok`,
	},
	{
		id: 'volume-confirmation',
		code: `# Volume Confirmation

# Momentum only when volume trend agrees.

let trend = diff price 10 in
let vtrend = diff volume 10 in
mul trend vtrend`,
	},
	{
		id: 'low-volume-fade',
		code: `# Low-Volume Fade

# Fade moves when volume is below average.

let move = price |> diff 5 |> neg in
let avg = mean volume 20 in
let low = lt volume avg in
let ok = if low 1 0 in
mul move ok`,
	},
	{
		id: 'breakout-vol-filter',
		code: `# Breakout + Vol Filter

# Breakout only when volatility is high.

let p1 = lag price 1 in
let hi = rolling_max p1 50 in
let breakout = gt price hi in
let b = if breakout 1 0 in
let vol = stdev price 20 in
let volOk = gt vol 0.01 in
let v = if volOk 1 0 in
mul b v`,
	},
	{
		id: 'compression-breakout',
		code: `# Compression Breakout

# Breakout after a low-volatility squeeze.

let vol = stdev price 20 in
let low = lt vol 0.005 in
let p1 = lag price 1 in
let hi = rolling_max p1 20 in
let breakout = gt price hi in
let cond = and low breakout in
if cond 1 0`,
	},
	{
		id: 'range-position',
		code: `# Range Position

# Position based on location inside the 50-bar range.

let p1 = lag price 1 in
let lo = rolling_min p1 50 in
let hi = rolling_max p1 50 in
let span = sub hi lo in
price
|> sub lo
|> div span
|> mul 2
|> sub 1`,
	},
	{
		id: 'range-fade',
		code: `# Range Fade

# Fade the 50-bar range position.

let p1 = lag price 1 in
let lo = rolling_min p1 50 in
let hi = rolling_max p1 50 in
let span = sub hi lo in
price
|> sub lo
|> div span
|> mul 2
|> sub 1
|> neg`,
	},
	{
		id: 'ema-vs-sma',
		code: `# EMA vs SMA

# Long when EMA is above SMA.

let ema20 = ema price 20 in
let sma20 = mean price 20 in
sub ema20 sma20`,
	},
	{
		id: 'fast-slow-vol',
		code: `# Fast/Slow Vol

# Long when fast volatility exceeds slow volatility.

let fast = stdev price 10 in
let slow = stdev price 50 in
sub fast slow`,
	},
	{
		id: 'trend-zscore-filter',
		code: `# Trend + Z-Score Filter

# Trend only when z-score magnitude is large.

let fast = ema price 12 in
let slow = ema price 26 in
let trend = sub fast slow in
let z = price |> zscore 20 |> abs in
let cond = gt z 1 in
let ok = if cond 1 0 in
mul trend ok`,
	},
	{
		id: 'mean-revert-spike',
		code: `# Mean Revert After Spike

# Fade large 1-bar moves.

let d = diff price 1 in
let size = abs d in
let vol = stdev price 20 in
let threshold = mul vol 2 in
let spike = gt size threshold in
let pos = neg d in
if spike pos 0`,
	},
	{
		id: 'trend-volume-filter',
		code: `# Trend + Volume Filter

# Trend only when volume is above average.

let trend = diff price 20 in
let avg = mean volume 20 in
let high = gt volume avg in
let ok = if high 1 0 in
mul trend ok`,
	},
	{
		id: 'price-above-max',
		code: `# Price Above Max

# Long when price makes a 200-bar high.

let p1 = lag price 1 in
let hi = rolling_max p1 200 in
let cond = gt price hi in
if cond 1 0`,
	},
	{
		id: 'price-below-min',
		code: `# Price Below Min

# Short when price makes a 200-bar low.

let p1 = lag price 1 in
let lo = rolling_min p1 200 in
let cond = lt price lo in
if cond -1 0`,
	},
	{
		id: 'mean-return-cross',
		code: `# Mean Return Cross

# Cross of short and long mean returns.

let r = diff price 1 in
let fast = mean r 5 in
let slow = mean r 20 in
sub fast slow`,
	},
	{
		id: 'zscore-trend-filter',
		code: `# Z-Score + Trend Filter

# Trend only when z-score magnitude is small.

let trend = diff price 20 in
let z = price |> zscore 20 |> abs in
let cond = lt z 2 in
let ok = if cond 1 0 in
mul trend ok`,
	},
	{
		id: 'ema-mean-reversion',
		code: `# EMA Mean Reversion

# Fade the EMA cross.

let fast = ema price 10 in
let slow = ema price 30 in
fast
|> sub slow
|> neg`,
	},
] as const;

export const algorithms: AlgorithmPreset[] = raw.map((algo) => ({
	...algo,
	...getDocstrings(algo.code, algo.id),
}));
