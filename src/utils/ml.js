import { clamp } from "./helpers";

export async function trainTinyModel(exps) {
  if (!window.tf) throw new Error("TensorFlow.js not loaded");
  if (!exps || exps.length < 3)
    throw new Error("Not enough experiences to train");

  const X = [];
  const y = [];
  for (const e of exps) {
    const f = {
      avgWaitN: clamp(e.waitMin / 30, 0, 1),
      avgCrowdN: clamp(e.crowd / 5, 0, 1),
      onTimeN: e.onTime ? 1 : 0,
      hourN: 0.5,
      avgOnboardN: clamp(e.onboardMin / 40, 0, 1),
      samplesN: 0.2,
    };
    X.push([
      f.avgWaitN,
      f.avgCrowdN,
      f.onTimeN,
      f.hourN,
      f.avgOnboardN,
      f.samplesN,
    ]);
    y.push([clamp((e.rating || 3) / 5, 0, 1)]);
  }

  const xs = tf.tensor2d(X);
  const ys = tf.tensor2d(y);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 8, inputShape: [6], activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
  model.compile({
    optimizer: tf.train.adam(0.05),
    loss: "meanSquaredError",
  });

  await model.fit(xs, ys, {
    epochs: 60,
    batchSize: 8,
    shuffle: true,
    verbose: 0,
  });
  await model.save("localstorage://ufx_model");
  xs.dispose();
  ys.dispose();
  return model;
}

export async function loadModel() {
  if (!window.tf) return null;
  try {
    return await tf.loadLayersModel("localstorage://ufx_model");
  } catch {
    return null;
  }
}
