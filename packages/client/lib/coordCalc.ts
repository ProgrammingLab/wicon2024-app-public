import CheapRuler from "cheap-ruler";

/**
 * 二点 A(x1, y1) と B(x2, y2) を通る直線を、その直線に垂直な方向へ距離 p だけ平行移動させた後の新しい二点の座標を計算します。
 *
 * @param x1 - 点 A の x 座標
 * @param y1 - 点 A の y 座標
 * @param x2 - 点 B の x 座標
 * @param y2 - 点 B の y 座標
 * @param p - 平行移動する距離（正または負の値で方向を指定）
 * @returns 新しい二点 A' と B' の座標オブジェクト
 */
export function movePointsPerpendicular(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  p: number,
): { x1Prime: number; y1Prime: number; x2Prime: number; y2Prime: number } {
  // 方向ベクトルの計算
  const dx = x2 - x1;
  const dy = y2 - y1;

  // ベクトルの長さ
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    throw new Error("点 A と点 B は同じ位置にあります。");
  }

  // 単位法線ベクトルの計算（直線に垂直な方向）
  const nx = -dy / length;
  const ny = dx / length;

  // 新しい座標の計算
  const x1Prime = x1 + p * nx;
  const y1Prime = y1 + p * ny;

  const x2Prime = x2 + p * nx;
  const y2Prime = y2 + p * ny;

  return { x1Prime, y1Prime, x2Prime, y2Prime };
}

/**
 * P_1(x_1, y_1), P_2(x_2, y_2), ... , P_N(x_N, y_N) からなるN角形の辺と直線A(A_X, A_Y)B(B_X, B_Y)の交点を求めます。
 *
 * @param x1 - 点 A の x 座標
 * @param y1 - 点 A の y 座標
 * @param x2 - 点 B の x 座標
 * @param y2 - 点 B の y 座標
 * @param points - N角形の頂点の座標の配列
 * @returns 交点の座標オブジェクトの配列またはnull
 */
export function getIntersectionsWithPolygon(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  points: { lon: number; lat: number }[],
): { x: number; y: number }[] | null {
  const intersections: { x: number; y: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const x3 = points[i].lon;
    const y3 = points[i].lat;

    const x4 = points[(i + 1) % points.length].lon;
    const y4 = points[(i + 1) % points.length].lat;

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denominator === 0) {
      continue;
    }

    const t1 = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    const t2 = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    if (t2 >= 0 && t2 <= 1) {
      const x = x1 + t1 * (x2 - x1);
      const y = y1 + t1 * (y2 - y1);
      intersections.push({ x, y });
    }
  }

  return intersections.length > 0 ? intersections : null;
}

export function rotateCoordinate(
  lat: number,
  lon: number,
  angle: number,
): { lat: number; lon: number } {
  const rad = (angle * Math.PI) / 180;
  const latResult = lat * Math.cos(rad) - lon * Math.sin(rad);
  const lonResult = lat * Math.sin(rad) + lon * Math.cos(rad);
  return { lat: latResult, lon: lonResult };
}

export function distance_line_to_point(
  point: { lon: number; lat: number },
  line: { lon1: number; lat1: number; lon2: number; lat2: number },
): number {
  const x1 = line.lon1;
  const y1 = line.lat1;
  const x2 = line.lon2;
  const y2 = line.lat2;
  const x0 = point.lon;
  const y0 = point.lat;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d =
    Math.abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) /
    Math.sqrt(dx * dx + dy * dy);
  return d;
}

export function choose_closest_point2(
  point: { lon: number; lat: number },
  lines: { longitude: number; latitude: number }[][],
): number {
  const ruler = new CheapRuler(point.lat, "meters");
  const distances = lines.map((line) => {
    return ruler.pointToSegmentDistance(
      [point.lon, point.lat],
      [line[0].longitude, line[0].latitude],
      [line[1].longitude, line[1].latitude],
    );
  });
  return distances.indexOf(Math.min(...distances));
}

/**
 * 特定の角度（＝進行方向）から見たときに、自分がある直線の右か左かを判定する
 */
export function checkPointPosition(
  lineStart: number[],
  lineEnd: number[],
  point: number[],
) {
  // 進行方向ベクトル
  const vectorLine = [lineEnd[0] - lineStart[0], lineEnd[1] - lineStart[1]];

  // 自分の位置へのベクトル
  const vectorPoint = [point[0] - lineStart[0], point[1] - lineStart[1]];

  // 2次元ベクトルの外積を計算
  const cross = vectorLine[0] * vectorPoint[1] - vectorLine[1] * vectorPoint[0];

  if (cross > 0) {
    return "left";
  } else if (cross < 0) {
    return "right";
  } else {
    return "on the line";
  }
}

/**
 * 北(0度)を基準に時計回りの角度を求める関数。
 * ここではベクトル (dx, dy) に対して atan2(dx, dy) を用いることで、
 * x=0, y>0 の場合に 0度(北)、
 * x>0, y=0 の場合に 90度(東) となるようにしています。
 */
export function getAngleFromNorth(
  start: [number, number],
  end: [number, number],
): number {
  const [sx, sy] = start;
  const [ex, ey] = end;
  const dx = ex - sx;
  const dy = ey - sy;

  // atan2 の引数は atan2(y, x) が一般的ですが
  // 北=0度になるようにしたいので atan2(dx, dy) を使う。
  const angle = Math.atan2(dx, dy); // ラジアン

  // ラジアン -> 度 へ変換し、0～360度に正規化
  return ((angle * 180) / Math.PI + 360) % 360;
}

/**
 * 2つの角度(0~360)間の差(0~180)を返す関数
 * たとえば 350度 と 10度 は 20度差とみなす
 */
function angleDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

type DirectionResult = "Start->End" | "End->Start" | "Neither";

/**
 * 自分の向いている角度 `orientation` が
 *   - Start->End の向きに近いか
 *   - End->Start の向きに近いか
 *   - どちらとも近くないか
 * を判定する関数サンプル
 */
export function getCloserDirection(
  start: [number, number],
  end: [number, number],
  orientation: number,
): DirectionResult {
  // Start->End の角度を求める
  const angleSE = getAngleFromNorth(start, end);

  // End->Start は上記の角度に 180 度足したもの(0～360度で正規化)
  const angleES = (angleSE + 180) % 360;

  const diffSE = angleDistance(orientation, angleSE);
  const diffES = angleDistance(orientation, angleES);

  // 必要に応じて「○○度以内なら近いと判定」など閾値を決める
  const THRESHOLD = 30; // 例: 30度

  const isCloseSE = diffSE < THRESHOLD;
  const isCloseES = diffES < THRESHOLD;

  // 両方とも近い場合は差を比較して小さい方を返すなど
  if (isCloseSE && isCloseES) {
    return diffSE <= diffES ? "Start->End" : "End->Start";
  }
  // 一方だけ近い場合
  if (isCloseSE) return "Start->End";
  if (isCloseES) return "End->Start";

  // どちらの差も大きい場合など
  return "Neither";
}
