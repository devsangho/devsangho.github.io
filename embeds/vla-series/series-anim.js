// Motion graphics for the VLA series. A post marks a spot with
// <figure class="anim" data-anim="name"></figure> and this file fills it with
// an SVG, a line of narration, a pause button and a scrubber. Each scene is a
// pure function of time, so scrubbing and reduced motion need no extra code.
(function () {
  const ko = document.documentElement.lang === 'ko';
  const T = (k, e) => (ko ? k : e);

  const INK = 'var(--ink)', INK2 = 'var(--ink-2)', RULE = 'var(--rule)', PAPER = 'var(--paper)';
  const BLUE = 'var(--blue)', GREEN = 'var(--green)', ORANGE = 'var(--orange)';
  const BS = 'var(--blue-soft)', GS = 'var(--green-soft)';

  const RX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--anim-rx')) || 7;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (x) => x * x * (3 - 2 * x);
  const seg = (t, a, b) => smooth(clamp((t - a) / (b - a)));
  const lerp = (a, b, x) => a + (b - a) * x;
  const pick = (t, list) => list.reduce((r, [a, s]) => (t >= a ? s : r), list[0][1]);

  const R = (x, y, w, h, f = 'none', s = RULE, o = 1, rx = RX, d = '') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${s}" stroke-width="1.4" opacity="${o}"${d ? ` stroke-dasharray="${d}"` : ''}/>`;
  const C = (x, y, r, f, o = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" opacity="${o}"/>`;
  const L = (x1, y1, x2, y2, s = INK2, w = 2, o = 1, d = '') =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}" opacity="${o}" stroke-linecap="round"${d ? ` stroke-dasharray="${d}"` : ''}/>`;
  const P = (d, s = INK2, w = 2, o = 1, dash = '') =>
    `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" opacity="${o}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  const A = (x1, y1, x2, y2, s = INK2, w = 2, o = 1) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    return L(x1, y1, x2, y2, s, w, o) +
      `<path d="M${x2} ${y2}L${x2 - h * Math.cos(a - 0.45)} ${y2 - h * Math.sin(a - 0.45)}L${x2 - h * Math.cos(a + 0.45)} ${y2 - h * Math.sin(a + 0.45)}Z" fill="${s}" opacity="${o}"/>`;
  };
  const X = (x, y, t, { s = 15, f = INK, a = 'middle', w = 400, o = 1 } = {}) =>
    `<text x="${x}" y="${y}" font-size="${s}" fill="${f}" text-anchor="${a}" font-weight="${w}" opacity="${o}">${t}</text>`;
  const B = (x, y, w, h, t, { f = PAPER, s = RULE, c = INK, size = 15, o = 1, weight = 600, d = '' } = {}) =>
    R(x, y, w, h, f, s, o, RX, d) + X(x + w / 2, y + h / 2 + size * 0.35, t, { s: size, f: c, w: weight, o });

  // Legend with real swatches. Colors change per post, so never name them in text.
  const KEY = (x, y, items) => items.map(([dx, col, tx, thin]) =>
    `<rect x="${x + dx}" y="${thin ? y - 6 : y - 11}" width="14" height="${thin ? 3 : 13}" rx="1.5" fill="${col}"/>` +
    X(x + dx + 20, y, tx, { s: 13, a: 'start', f: INK2 })).join('');

  // Deterministic noise, so a scene looks the same on every pass.
  const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const SCENES = {
    // Part 1: why the future is hidden although the dataset already has it.
    causal: {
      h: 262, dur: 14,
      title: T('학습할 때 정답을 왜 가릴까', 'Why training hides the answers'),
      draw(t) {
        const v = [150, 87, 203, 12, 96], W = 84, G = 10, X0 = (520 - 5 * W - 4 * G) / 2;
        const cx = (i) => X0 + i * (W + G);
        const cheat = t >= 10;
        const i = cheat ? 2 : Math.min(4, Math.floor(Math.max(0, t - 1.2) / 1.75));
        const p = cheat ? 2 : (t - 1.2) - i * 1.75;
        let s = X(X0, 22, T('입력으로 볼 수 있는 토큰', 'Tokens the model may read'), { s: 15, a: 'start', w: 700 });
        s += X(X0, 200, T('맞혀야 할 정답', 'Answers to predict'), { s: 15, a: 'start', w: 700 });
        s += B(190, 118, 140, 44, T('언어모델', 'Language model'), { f: BS, s: BLUE, size: 15 });
        for (let j = 0; j < 5; j++) {
          const seen = t < 1.2 || cheat || j < i;
          if (seen) s += B(cx(j), 34, W, 44, v[j], { f: cheat && j >= 2 ? 'none' : BS, s: cheat && j >= 2 ? ORANGE : BLUE, size: 16, c: cheat && j >= 2 ? ORANGE : INK });
          else s += B(cx(j), 34, W, 44, T('가림', 'hidden'), { s: RULE, c: INK2, size: 14, weight: 400, d: '4 4' });
          if (t >= 1.2 && !cheat && j < i) s += A(cx(j) + W / 2, 80, lerp(225, 295, j / 4), 116, BLUE, 1.6, 0.6);
          const y = 210;
          if (t < 1.2) s += B(cx(j), y, W, 44, v[j], { s: GREEN, f: GS, size: 16 });
          else if (cheat) {
            if (j === 2) s += B(cx(j), y, W, 44, v[j], { s: ORANGE, c: ORANGE, size: 16 });
            else s += R(cx(j), y, W, 44, 'none', RULE, 1, RX, '4 4');
          } else if (j < i) s += B(cx(j), y, W, 44, v[j] + ' ✓', { s: GREEN, f: GS, size: 15 });
          else if (j === i) s += B(cx(j), y, W, 44, p < 0.8 ? '?' : v[j] + ' ✓', { s: p < 0.8 ? ORANGE : GREEN, f: p < 0.8 ? 'none' : GS, c: p < 0.8 ? ORANGE : INK, size: 16 });
          else s += R(cx(j), y, W, 44, 'none', RULE, 1, RX, '4 4');
        }
        if (t >= 1.2 && !cheat) s += A(260, 164, cx(i) + W / 2, 207, ORANGE, 2);
        if (cheat) s += P(`M${cx(2) + W / 2} 80 C${cx(2) + W / 2 + 90} 120 ${cx(2) + W / 2 + 90} 170 ${cx(2) + W / 2} 207`, ORANGE, 2.4);
        return {
          svg: s,
          step: pick(t, [
            [0, T('데이터셋에는 이 시점의 정답 토큰이 전부 들어 있다.', 'The dataset already holds every answer token for this time step.')],
            [1.2, T('첫 토큰을 맞힐 때는 이미지와 언어만 본다. 정답 토큰은 모두 가려 둔다.', 'For the first token the model reads only the image and text. Every answer stays covered.')],
            [3, T('앞 토큰은 입력으로 공개하고, 지금 맞힐 자리부터는 가린다.', 'Earlier tokens are revealed as input. The slot being predicted and everything after it stay covered.')],
            [6.5, T('가린 정답을 버리는 것이 아니다. 예측을 낸 뒤 손실을 계산할 때는 정답으로 쓴다.', 'The hidden answers are not thrown away. They are used to compute the loss once the prediction is out.')],
            [10, T('가리지 않으면 입력에 있는 정답을 그대로 베낀다. 손실은 0이 되지만 아무것도 배우지 못한다.', 'Without the mask the model just copies the answer from its input. The loss hits zero and nothing is learned.')],
            [12, T('실제 로봇 앞에는 미래의 정답이 없으니, 베끼는 법만 배운 모델은 동작하지 않는다.', 'On a real robot there is no future to copy from, so a model that only learned to copy fails.')],
          ]),
        };
      },
    },

    // Part 2: chunking is a change of labels and outputs, not a prompt.
    chunk: {
      h: 290, dur: 15,
      title: T('행동을 어떻게 묶는가', 'How actions get bundled'),
      draw(t) {
        const n = 14, W = 30, G = 5, X0 = (520 - n * W - (n - 1) * G) / 2;
        const x = (i) => X0 + i * (W + G), K = 5;
        const at = t < 6.5 ? 2 : t < 9.7 ? 2 + Math.floor(seg(t, 6.5, 9.7) * 6 + 0.001) : 8;
        const len = t < 3.2 ? 1 : K;
        let s = X(X0, 20, T('시연 기록', 'Recorded demonstration'), { s: 15, a: 'start', w: 700 });
        s += X(520 - X0, 20, T('명령: "빨간 컵을 집어" (그대로)', 'Prompt: "pick up the red cup" (unchanged)'), { s: 14, a: 'end', f: INK2 });
        for (let i = 0; i < n; i++) {
          const on = i === at && t >= 1.6;
          s += B(x(i), 32, W, 32, 'o', { f: on ? BS : PAPER, s: on ? BLUE : RULE, c: on ? BLUE : INK2, size: 14, weight: 600 });
          const h = 12 + 26 * (0.5 + 0.5 * Math.sin(i * 0.8));
          const lab = t >= 1.6 && i >= at && i < at + len;
          s += R(x(i) + 4, 120 - h, W - 8, h, lab ? GS : BS, lab ? GREEN : BLUE, 1, 3);
        }
        s += X(X0, 142, T('o: 관측, 막대: 실제로 실행된 행동', 'o: observation, bars: action actually executed'), { s: 13, a: 'start', f: INK2 });
        if (t >= 1.6) s += A(x(at) + W / 2, 66, x(at) + W / 2, 76, BLUE, 1.8);
        if (t >= 1.6) s += R(x(at) - 3, 74, len * W + (len - 1) * G + 6, 50, 'none', GREEN, 1, 6);
        const slots = t >= 9.7 ? K : 1, sw = 68, sg = 8, sx = (520 - slots * sw - (slots - 1) * sg) / 2;
        s += X(260, 172, T('모델의 출력 자리', 'Output slots of the model'), { s: 15, w: 700 });
        const grow = seg(t, 9.7, 10.6);
        for (let j = 0; j < slots; j++) {
          const o = j === 0 ? 1 : grow;
          s += B(sx + j * (sw + sg), 184, sw, 40, 'a' + (j === 0 ? 't' : 't+' + j), { f: BS, s: BLUE, size: 14, o });
          if (t >= 12) {
            s += A(sx + j * (sw + sg) + sw / 2, 228, sx + j * (sw + sg) + sw / 2, 250, ORANGE, 1.8, seg(t, 12, 12.6));
            s += X(sx + j * (sw + sg) + sw / 2, 270, T('손실', 'loss'), { s: 13, f: ORANGE, o: seg(t, 12, 12.6) });
          }
        }
        return {
          svg: s,
          step: pick(t, [
            [0, T('사람이 조종한 시연에는 매 시점의 관측과 실제 행동이 함께 기록된다.', 'A teleoperated demo records the observation and the executed action at every time step.')],
            [1.6, T('chunk가 없다면 현재 관측의 정답은 지금 행동 하나다.', 'Without chunking, the label for the current observation is a single action.')],
            [3.2, T('chunk를 쓰면 같은 기록에서 정답을 앞으로 K개까지 길게 자른다. 프롬프트는 한 글자도 안 바뀐다.', 'With chunking, the same recording supplies the next K actions as the label. The prompt does not change at all.')],
            [6.5, T('창을 한 칸씩 밀면 시연 하나에서 학습 샘플이 여러 개 나온다.', 'Sliding the window one step at a time yields many training samples from one demo.')],
            [9.7, T('모델 쪽은 출력 자리를 K개로 늘린다. 이것이 아키텍처 변경이다.', 'On the model side, the output grows to K slots. This is the architectural change.')],
            [12, T('각 자리를 해당 시점의 정답과 비교해 손실을 계산한다. 그래서 모델은 미래까지 함께 배운다.', 'Each slot is compared with the label for its own time step, so the model learns the near future too.')],
          ]),
        };
      },
    },

    // Part 2: what "parallel" means. The two lanes race.
    seqpar: {
      h: 310, dur: 10,
      title: T('왜 "병렬"이라고 부를까', 'Why it is called "parallel"'),
      draw(t) {
        const vals = ['0.3', '0.5', '0.7'], cell = (i) => 176 + i * 104;
        const pass = 1.6, start = 0.4;
        const lane = (y, title, count) =>
          X(16, y, title, { s: 15, a: 'start', w: 700 }) +
          X(504, y, T(`순전파 ${count}회`, `${count} forward pass${count === 1 ? '' : 'es'}`), { s: 15, a: 'end', f: count ? ORANGE : INK2, w: 700 }) +
          B(16, y + 14, 110, 58, T('모델', 'Model'), { f: BS, s: BLUE });
        let s = '';
        const k = clamp(Math.floor((t - start) / pass), 0, 3), passing = t >= start && k < 3;
        const count = t < start ? 0 : Math.min(3, k + (passing ? 1 : 0));
        s += lane(20, T('순차 (OpenVLA)', 'Sequential (OpenVLA)'), count);
        for (let i = 0; i < 3; i++) {
          const done = k > i || (k === i && t - start - k * pass > pass / 2);
          s += done ? B(cell(i), 34, 88, 58, vals[i], { f: GS, s: GREEN, size: 18 }) : B(cell(i), 34, 88, 58, '?', { s: RULE, c: INK2, size: 18, d: '4 4' });
        }
        if (passing) {
          const p = (t - start - k * pass) / pass, tx = cell(k);
          if (p < 0.5) { const q = p * 2; s += L(126, 63, tx, 63, BLUE, 1.6, 0.5) + C(lerp(126, tx, q), 63, 6, BLUE); }
          else {
            const q = (p - 0.5) * 2, bx = lerp(tx + 44, 71, q), by = q < 0.15 ? lerp(92, 108, q / 0.15) : q > 0.85 ? lerp(108, 92, (q - 0.85) / 0.15) : 108;
            s += P(`M${tx + 44} 94V108H71V94`, ORANGE, 1.8, 0.7) + C(bx, by, 6, ORANGE);
            s += X(lerp(tx + 44, 71, 0.5), 126, T(`${vals[k]} → 다음 입력`, `${vals[k]} → next input`), { s: 13, f: ORANGE });
          }
        }
        const k2 = t < start ? 0 : t < start + pass ? 1 : 1;
        s += lane(176, T('병렬 (OFT)', 'Parallel (OFT)'), t < start ? 0 : k2);
        const parDone = t >= start + pass * 0.55;
        for (let i = 0; i < 3; i++) s += parDone ? B(cell(i), 190, 88, 58, vals[i], { f: GS, s: GREEN, size: 18 }) : B(cell(i), 190, 88, 58, T('빈 자리', 'empty'), { f: BS, s: BLUE, size: 14, weight: 400 });
        if (t >= start && !parDone) {
          const q = (t - start) / (pass * 0.55);
          for (let i = 0; i < 3; i++) s += L(126, 219, cell(i), 219, BLUE, 1.6, 0.35) + C(lerp(126, cell(i), q), 219, 6, BLUE);
        }
        if (t >= start + pass * 0.55 && t < 5.2) s += X(292, 276, T('앞 값을 기다리지 않고 함께 끝났다', 'finished together, no waiting on earlier values'), { s: 14, f: GREEN, w: 600 });
        return {
          svg: s,
          step: pick(t, [
            [0, T('같은 세 값을 두 방식으로 만든다. 예시 값이다.', 'Both methods produce the same three values, used here as an example.')],
            [0.4, T('순차 방식은 첫 값이 나온 뒤에야 다음 계산을 시작할 수 있다.', 'The sequential model cannot start the next value until the previous one exists.')],
            [2, T('병렬 방식은 자리를 미리 만들어 두고 계산 한 번으로 모두 채운다. 그 사이 순차 방식은 아직 계산 중이다.', 'The parallel model prepares every slot and fills them in one pass, while the sequential model is still working.')],
            [5.3, T('병렬이라는 말은 관절이 서로 독립이라는 뜻이 아니다. 앞의 예측값을 기다리지 않고 함께 계산한다는 뜻이다.', '"Parallel" does not mean the joints are independent. It means the values are computed together, without waiting on earlier predictions.')],
            [7.8, T('세 값은 하나의 모델에서 나오고 함께 학습되므로 서로 관련될 수 있다. 달라지는 것은 계산 순서뿐이다.', 'The values come from one model trained jointly, so they can still be related. Only the order of computation changes.')],
          ]),
        };
      },
    },

    // Part 2: the two kinds of feedback, and predict-at-once vs execute-in-order.
    feedback: {
      h: 300, dur: 17,
      title: T('되먹임은 무엇이 다른가', 'What differs about the feedback'),
      draw(t) {
        const oft = t >= 8.5, u = oft ? t - 8.5 : t;
        const cell = (i) => 138 + i * 76;
        let s = X(16, 22, oft ? 'OpenVLA-OFT' : 'OpenVLA', { s: 17, a: 'start', w: 800, f: BLUE });
        s += B(14, 104, 100, 66, T('모델', 'Model'), { f: BS, s: BLUE });
        let pose = 0, shown = 0, exec = -1, orange = -1, green = 0;
        if (!oft) {
          shown = clamp(Math.floor((u - 0.4) / 1.15) + 1, 0, 3);
          if (u >= 0.4 && u < 3.85) { const k = Math.floor((u - 0.4) / 1.15), p = (u - 0.4) - k * 1.15; if (p > 0.45) orange = k + (p - 0.45) / 0.7; }
          pose = seg(u, 4.2, 5.4);
          if (u >= 5.6) green = seg(u, 5.6, 7.4) + 1e-3;
        } else {
          shown = u >= 1.1 ? 3 : 0;
          exec = u >= 1.5 && u < 5.1 ? Math.floor((u - 1.5) / 1.2) : u >= 5.1 ? 3 : -1;
          pose = clamp((u - 1.5) / 3.6, 0, 1) * 3;
          if (u >= 5.6) green = seg(u, 5.6, 7.4) + 1e-3;
        }
        for (let i = 0; i < 3; i++) {
          const lab = oft ? T(`시점 ${i + 1}`, `step ${i + 1}`) : T(`차원 ${i + 1}`, `dim ${i + 1}`);
          const on = i < shown, cur = exec === i;
          s += on ? B(cell(i), 112, 66, 50, lab, { f: cur ? 'var(--hl-soft)' : GS, s: cur ? 'var(--hl)' : GREEN, size: 14 }) : B(cell(i), 112, 66, 50, '?', { c: INK2, d: '4 4' });
        }
        if (orange >= 0) {
          const k = Math.floor(orange), q = orange - k, x0 = cell(k) + 33;
          s += P(`M${x0} 110V74H64V102`, ORANGE, 2, 0.8) + C(lerp(x0, 64, q), 74, 6, ORANGE);
          s += X((x0 + 64) / 2, 64, T('예측값을 다시 입력', 'prediction fed back'), { s: 14, f: ORANGE, w: 600 });
        }
        if (oft && u >= 1.1 && u < 5.5) s += X(250, 74, T('예측값 되먹임 없음, 계산은 한 번', 'no prediction feedback, one computation'), { s: 14, f: INK2 });
        const ax = 438, ay = 232;
        const a1 = 1.15 - 0.2 * pose, a2 = a1 - 0.9 + 0.1 * pose;
        const ex = ax + 54 * Math.cos(a1), ey = ay - 54 * Math.sin(a1);
        s += R(ax - 24, ay, 48, 12, INK2, INK2, 1, 3);
        s += L(ax, ay, ex, ey, INK, 6) + L(ex, ey, ex + 46 * Math.cos(a2), ey - 46 * Math.sin(a2), INK, 5) + C(ex, ey, 5, BLUE);
        s += X(ax, 276 - 8, T('로봇', 'Robot'), { s: 14, f: INK2 });
        const arrowOn = oft ? exec >= 0 && exec < 3 : u >= 4.2 && u < 5.4;
        s += A(cell(2) + 70, 137, 384, 137, arrowOn ? GREEN : RULE, 2);
        if (green) {
          s += P('M438 270V288H64V172', GREEN, 2, 0.8);
          const len = 374 + 116, d = green * len;
          const px = d < 374 ? 438 - d : 64, py = d < 374 ? 288 : 288 - (d - 374);
          s += C(px, py, 6, GREEN) + X(250, 282, T('실제로 움직인 뒤 다시 본 관측', 'observation after the real motion'), { s: 14, f: GREEN, w: 600 });
        }
        return {
          svg: s,
          step: pick(t, [
            [0, T('OpenVLA: 같은 예측 안에서 앞서 만든 토큰을 다시 입력에 넣는다. 세 칸은 한 시점의 행동 차원들이다.', 'OpenVLA feeds its own tokens back within one prediction. The cells are dimensions of one action.')],
            [4.2, T('토큰이 다 나온 뒤에 완성된 행동 하나를 로봇이 실행한다.', 'Once all tokens exist, the robot executes that one finished action.')],
            [5.6, T('움직인 뒤 다시 찍은 이미지로 다음 예측을 한다. 로봇에서 모델로 돌아오는 이 고리가 제어 피드백이다.', 'A new image taken after the motion drives the next prediction. The loop from the robot back to the model is control feedback.')],
            [8.5, T('OFT: 세 칸은 미래의 세 시점이다. 내부에서 예측값을 되먹이지 않고 한 번에 계산한다.', 'OFT: the cells are three future time steps. They are computed at once, with no prediction fed back.')],
            [10, T('계산은 한 번이어도 실행은 동시에 할 수 없다. 로봇은 행동을 시간 순서대로 실행한다.', 'The computation is a single pass, but execution cannot be simultaneous. The robot runs the actions in order.')],
            [14.1, T('다 움직인 뒤 관측을 다시 받아 다음 chunk를 만든다. OFT에도 제어 피드백은 있다. 없는 것은 예측값의 되먹임이다.', 'After moving, a new observation produces the next chunk. OFT keeps control feedback. What it drops is feeding predictions back.')],
          ]),
        };
      },
    },

    // Part 2: regression and gradient descent, computed for real.
    mlp: (function () {
      const h = [0.5, 0.8], a = [0.3, 0.7], lr = 0.1, trace = [];
      let W = [[0.2, 0.1], [0.4, 0.3]];
      for (let k = 0; k <= 60; k++) {
        const p = W.map((r) => r[0] * h[0] + r[1] * h[1]);
        trace.push({ W: W.map((r) => r.slice()), p, L: ((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2) / 2 });
        W = W.map((r, i) => r.map((w, j) => w - lr * (p[i] - a[i]) * h[j]));
      }
      return {
        h: 280, dur: 11,
        title: T('회귀: 틀린 만큼 가중치를 고친다', 'Regression: adjusting weights by the error'),
        draw(t) {
          const k = Math.round(seg(t, 1.5, 9.5) * 60), S = trace[k];
          const inY = [64, 140], ox = 188, ix = 46;
          let s = X(ix, 24, T('입력', 'input'), { s: 14, f: INK2 }) + X(ox, 24, T('예측', 'output'), { s: 14, f: INK2 });
          for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++)
            s += L(ix + 22, inY[j], ox - 22, inY[i], BLUE, 1 + 9 * Math.abs(S.W[i][j]), 0.55);
          for (let j = 0; j < 2; j++) s += C(ix, inY[j], 22, BS) + X(ix, inY[j] + 5, h[j], { s: 14, w: 600 });
          for (let i = 0; i < 2; i++) s += C(ox, inY[i], 24, GS) + X(ox, inY[i] + 5, S.p[i].toFixed(2), { s: 14, w: 600 });
          const sx = (v) => 268 + v * 230;
          for (let i = 0; i < 2; i++) {
            s += X(268, inY[i] - 18, T(`관절 ${i + 1}`, `joint ${i + 1}`), { s: 14, a: 'start', f: INK2 });
            s += L(sx(0), inY[i], sx(1), inY[i], RULE, 2);
            s += L(sx(a[i]), inY[i] - 12, sx(a[i]), inY[i] + 12, GREEN, 3);
            s += C(sx(S.p[i]), inY[i], 8, BLUE);
          }
          s += X(498, 24, T('막대: 정답, 점: 예측', 'bar: target, dot: prediction'), { s: 13, a: 'end', f: INK2 });
          const lx = (q) => 90 + (q / 60) * 410, ly = (v) => 268 - (v / 0.041) * 66;
          s += X(16, 214, T('손실', 'loss'), { s: 14, a: 'start', f: ORANGE, w: 700 }) + X(16, 234, S.L.toFixed(4), { s: 14, a: 'start', w: 600 });
          s += L(90, 268, 500, 268, RULE, 1.5);
          s += P(trace.slice(0, k + 1).map((q, i) => `${i ? 'L' : 'M'}${lx(i)} ${ly(q.L)}`).join(''), ORANGE, 2.5) + C(lx(k), ly(S.L), 5, ORANGE);
          return {
            svg: s,
            step: pick(t, [
              [0, T('실제 계산이다. 입력 [0.5, 0.8], 정답 [0.3, 0.7]인데 처음 예측은 [0.18, 0.44]로 틀렸다.', 'This is the real computation. With input [0.5, 0.8] and target [0.3, 0.7], the first prediction [0.18, 0.44] is wrong.')],
              [1.5, T(`틀린 정도(손실)를 미분해 각 가중치를 조금 고친다. 첫 가중치 W₁₁: ${S.W[0][0].toFixed(3)}`, `The loss is differentiated and every weight is nudged. First weight W₁₁: ${S.W[0][0].toFixed(3)}`)],
              [9.5, T('회귀는 이 과정을 반복해 연속적인 숫자 자체를 맞히는 것이다. 70개 출력도 원리는 같다.', 'Regression repeats this to hit continuous numbers directly. Seventy outputs work the same way.')],
            ]),
          };
        },
      };
    })(),

    // Part 3: flow matching regresses a direction, then chunk-wide refinement.
    flow: {
      h: 310, dur: 16,
      title: T('무엇을 회귀하고, 어떻게 고치는가', 'What is regressed, and how actions get refined'),
      draw(t) {
        if (t < 8.5) {
          const sx = (v) => 40 + ((v + 0.5) / 1.5) * 440, eps = -0.2, a = 0.8;
          let s = X(16, 24, T('OFT가 맞히는 것', 'What OFT regresses'), { s: 15, a: 'start', w: 700 });
          s += L(sx(-0.5), 70, sx(1), 70, RULE, 2) + A(sx(0.32), 44, sx(a), 62, GREEN, 2) + X(sx(0.32) - 8, 49, T('관측에서 바로 예측', 'direct from observation'), { s: 13, a: 'end', f: GREEN });
          s += C(sx(a), 70, 8, GREEN) + X(sx(a), 100, T('행동값 0.8', 'action 0.8'), { s: 14, f: GREEN, w: 600 });
          s += X(16, 140, T('π0가 맞히는 것', 'What π0 regresses'), { s: 15, a: 'start', w: 700 });
          const y = 220, taus = [0.25, 0.5, 0.75], k = clamp(Math.floor(Math.max(0, t - 1.5) / 2.3), 0, 2), tau = taus[k];
          const pos = (1 - tau) * eps + tau * a, p = pos;
          s += L(sx(-0.5), y, sx(1), y, RULE, 2);
          s += P(`M${sx(eps)} ${y}L${sx(a)} ${y}`, INK2, 2, 0.5, '5 5');
          s += C(sx(eps), y, 8, ORANGE) + X(sx(eps), y + 30, T('노이즈 -0.2', 'noise -0.2'), { s: 14, f: ORANGE, w: 600 });
          s += C(sx(a), y, 8, GREEN) + X(sx(a), y + 30, T('정답 0.8', 'target 0.8'), { s: 14, f: GREEN, w: 600 });
          if (t >= 1.5) {
            s += C(sx(p), y, 7, BLUE) + X(sx(p), y + 30, 'τ=' + tau, { s: 14, f: BLUE, w: 600 });
            const phase = clamp((t - 1.5 - k * 2.3) / 2.3), scale = 90, pred = lerp(0.55, 1, phase);
            s += A(sx(p), y - 34, sx(p) + 1.0 * scale, y - 34, GREEN, 3);
            s += X(sx(p) + scale + 6, y - 29, T('정답 방향 1.0', 'target velocity 1.0'), { s: 13, a: 'start', f: GREEN, w: 600 });
            s += A(sx(p), y - 14, sx(p) + pred * scale, y - 14, BLUE, 3);
            s += X(sx(p) + pred * scale + 6, y - 9, T('예측 ', 'pred ') + pred.toFixed(2), { s: 13, a: 'start', f: BLUE, w: 600 });
          }
          return {
            svg: s,
            step: pick(t, [
              [0, T('OFT의 정답은 행동값 자체다. π0는 노이즈 하나를 뽑아 정답과 잇는다.', 'OFT targets the action value itself. π0 draws noise and connects it to the target.')],
              [1.5, T('선 위의 임의의 지점에서 "어느 방향으로 얼마나" 가야 하는지를 맞히도록 학습한다. 이것도 회귀다.', 'At any point on the line, the model learns which way to move and how far. This is regression too.')],
              [6, T('달라진 것은 회귀의 대상이다. 행동값이 아니라 노이즈에서 행동으로 가는 속도다.', 'Only the regression target changed. It is the velocity from noise to action, not the action value.')],
            ]),
          };
        }
        const u = t - 8.5, n = 12, r = rng(11), noise = [], target = [];
        for (let i = 0; i < n; i++) { noise.push((r() - 0.5) * 2.2); target.push(0.65 * Math.sin(i * 0.5 - 0.6) + 0.15); }
        const k = Math.floor(clamp(u / 6) * 10 + 1e-6), tau = k / 10, W = 30, X0 = 54, base = 160, sc = 95;
        let s = X(16, 24, T('행동 chunk 전체를 함께 고치기', 'Refining the whole chunk at once'), { s: 15, a: 'start', w: 700 });
        s += X(504, 24, T(`적분 ${k} / 10`, `step ${k} of 10`), { s: 15, a: 'end', w: 700, f: BLUE });
        s += L(X0 - 8, base, 500, base, RULE, 1.5);
        for (let i = 0; i < n; i++) {
          const v = (1 - tau) * noise[i] + tau * target[i], y = base - v * sc;
          s += `<rect x="${X0 + i * 37}" y="${Math.min(y, base)}" width="${W}" height="${Math.abs(base - y)}" rx="3" fill="${BLUE}" opacity="0.75"/>`;
          s += L(X0 + i * 37, base - target[i] * sc, X0 + i * 37 + W, base - target[i] * sc, GREEN, 3);
        }
        s += KEY(16, 296, [[0, BLUE, T('현재 행동 후보', 'current candidate')], [ko ? 130 : 150, GREEN, T('시연과 같은 행동 (추론 때는 볼 수 없음)', 'demo-like action (unseen at inference)'), true]]);
        return {
          svg: s,
          step: pick(u, [
            [0, T('추론 때는 정답이 없다. 랜덤 숫자에서 출발해 현재 위치의 방향을 예측하고 조금 움직인다.', 'At inference there is no target. Starting from random numbers, the model predicts a direction and moves a little.')],
            [1.5, T('OpenVLA처럼 한 자리씩 만드는 것이 아니라, 전체 chunk를 매번 함께 고친다.', 'Unlike OpenVLA, it does not fill one slot at a time. The whole chunk is revised at every step.')],
            [6, T('열 번의 수정은 그 자체로 더 정확해지는 마법이 아니라, 학습된 흐름을 따라가는 계산이다.', 'The ten revisions are not accuracy magic. They are how the learned flow is followed numerically.')],
          ]),
        };
      },
    },

    // Part 3: why start from noise. Two valid demos around an obstacle.
    modes: {
      h: 300, dur: 15,
      title: T('왜 노이즈에서 시작할까', 'Why start from noise'),
      draw(t) {
        const ox = 400, cy = 150, up = 60, dn = 240, sx = 60;
        let s = R(ox - 28, cy - 32, 56, 64, 'var(--hl-soft)', 'var(--hl)') + X(ox, cy + 5, T('장애물', 'obstacle'), { s: 13 });
        s += C(sx, cy, 10, INK2) + X(sx, cy + 32, T('시작', 'start'), { s: 14, f: INK2 });
        const curve = (y) => `M${sx} ${cy}C160 ${cy} 220 ${y} ${ox} ${y}L490 ${y}`;
        const demoOp = seg(t, 0.2, 1.6) * (t < 8 ? 1 : 0.35);
        s += P(curve(up), GREEN, 3, demoOp) + P(curve(dn), GREEN, 3, demoOp);
        s += X(470, up - 12, T('왼쪽으로', 'go left'), { s: 14, f: GREEN, w: 600, o: demoOp }) + X(470, dn + 24, T('오른쪽으로', 'go right'), { s: 14, f: GREEN, w: 600, o: demoOp });
        if (t >= 4 && t < 8) {
          const q = seg(t, 4, 6);
          s += L(sx, cy, lerp(sx, ox - 30, q), cy, ORANGE, 4);
          if (q >= 1) s += X(ox - 44, cy - 14, '✕', { s: 28, f: ORANGE, w: 800 });
        }
        if (t >= 8) {
          const r = rng(7), q = seg(t, 8.6, 13);
          for (let i = 0; i < 36; i++) {
            const y0 = cy + (r() - 0.5) * 150, dest = y0 < cy ? up : dn;
            s += C(lerp(sx, ox + 55, q), lerp(y0, dest, q), 3.6, BLUE, 0.75);
            s += L(sx, y0, lerp(sx, ox + 55, q), lerp(y0, dest, q), BLUE, 0.7, 0.2);
          }
        }
        return {
          svg: s,
          step: pick(t, [
            [0, T('장애물을 왼쪽으로 돌아도, 오른쪽으로 돌아도 성공이다. 시연에는 두 경로가 함께 들어 있다.', 'Going around the obstacle on either side succeeds, and the demos contain both routes.')],
            [4, T('MSE로 한 값을 직접 회귀하면 두 경로의 평균으로 끌려가 장애물로 향할 수 있다.', 'Regressing a single value with MSE can be pulled to the average of the two routes, straight at the obstacle.')],
            [8, T('flow matching은 분포를 배운다. 출발 노이즈가 어디냐에 따라 한 경로로 정해진다.', 'Flow matching learns a distribution. Where the noise starts decides which route a sample takes.')],
            [13, T('여러 번 고치는 것 자체가 장점이 아니다. 장점은 가능한 행동의 분포를 표현한다는 데 있다.', 'Revising many times is not the benefit. The benefit is representing a distribution of possible actions.')],
          ]),
        };
      },
    },

    // Part 3: the block-wise attention mask, one query token at a time.
    pimask: {
      h: 300, dur: 13,
      title: T('마스킹: 누가 누구를 볼 수 있나', 'Masking: who can read whom'),
      draw(t) {
        const names = ko ? ['이미지', '언어', '로봇 상태', '행동 1', '행동 2'] : ['image', 'language', 'state', 'action 1', 'action 2'];
        const short = ko ? ['이', '언', '상', '행1', '행2'] : ['I', 'L', 'S', 'A1', 'A2'];
        const blk = [0, 0, 1, 2, 2], ty = (i) => 36 + i * 50, cs = 44, gx = 280, gy = 54;
        const i = t >= 9.2 ? 4 : clamp(Math.floor(Math.max(0, t - 0.6) / 1.7), 0, 4);
        let s = '';
        for (let j = 0; j < 5; j++) s += B(14, ty(j), 112, 40, names[j], { f: j === i && t < 9.2 ? BS : PAPER, s: j === i && t < 9.2 ? BLUE : RULE, size: 14 });
        if (t >= 0.6 && t < 9.2) for (let j = 0; j < 5; j++) {
          if (j === i) continue;
          const see = blk[j] <= blk[i], y1 = ty(i) + 20, y2 = ty(j) + 20, b = 150 + Math.abs(i - j) * 22;
          if (see) s += P(`M126 ${y1}C${b} ${y1} ${b} ${y2} 130 ${y2}`, BLUE, 2.2) + `<path d="M138 ${y2 - 5}L130 ${y2}L138 ${y2 + 5}Z" fill="${BLUE}"/>`;
          else s += X(146, y2 + 6, '✕', { s: 17, f: ORANGE, w: 800 });
        }
        s += X(gx + cs * 2.5, 22, T('읽는 대상', 'token being read'), { s: 14, f: INK2 });
        for (let j = 0; j < 5; j++) s += X(gx + j * cs + cs / 2, gy - 8, short[j], { s: 13, f: INK2 });
        for (let r = 0; r < 5; r++) {
          s += X(gx - 12, gy + r * cs + cs / 2 + 5, short[r], { s: 13, f: INK2, a: 'end' });
          for (let c = 0; c < 5; c++) {
            const lit = t >= 0.6 && (r < i || (r === i));
            const yes = blk[c] <= blk[r];
            const hot = t >= 9.2 && r <= 2 && c >= 3;
            s += R(gx + c * cs + 2, gy + r * cs + 2, cs - 4, cs - 4, lit && yes ? BLUE : hot ? 'var(--hl-soft)' : 'none', hot ? 'var(--hl)' : RULE, lit && yes ? 0.8 : 1, 4);
          }
        }
        return {
          svg: s,
          step: pick(t, [
            [0, T('각 토큰이 다른 토큰을 읽을 수 있는지 표로 채운다. 가로줄이 읽는 쪽이다.', 'Fill in which tokens each token may read. A row is the reader.')],
            [0.6, T('이미지와 언어는 자기들끼리만 본다. 뒤쪽의 로봇 상태와 행동은 읽지 못한다.', 'Image and language tokens read only each other, not the robot state or actions behind them.')],
            [4, T('로봇 상태는 앞의 이미지와 언어를 읽지만, 행동은 읽지 못한다.', 'The robot state reads image and language, but not the actions.')],
            [5.7, T('행동 토큰은 전부 읽는다. 행동 토큰끼리도 양방향으로 본다.', 'Action tokens read everything, including one another in both directions.')],
            [9.2, T('강조된 칸이 핵심이다. 앞쪽 토큰은 매번 바뀌는 노이즈 행동을 안 보므로, 결과가 달라지지 않는다.', 'The highlighted cells are the point. The early tokens never read the changing noisy actions, so their outputs stay fixed.')],
          ]),
        };
      },
    },

    // Part 3: caching, from the latencies in the paper's Table I.
    cache: {
      h: 250, dur: 11,
      title: T('캐싱: 한 번 계산한 것을 다시 쓰기', 'Caching: reusing one computation'),
      draw(t) {
        const total = 361, sx = (ms) => 16 + (ms / total) * 488, head = seg(t, 0.5, 8) * total;
        const parts = (y, list) => {
          let at = 0, s = '';
          for (const [ms, col] of list) {
            const end = at + ms;
            if (head > at) s += `<rect x="${sx(at)}" y="${y}" width="${Math.max(1.5, sx(Math.min(end, head)) - sx(at) - 0.8)}" height="44" fill="${col}" opacity="0.85"/>`;
            at = end;
          }
          return s;
        };
        const nc = [[14, INK2]], c = [[14, INK2], [32, BLUE]];
        for (let i = 0; i < 10; i++) { nc.push([32, BLUE], [2.7, GREEN]); c.push([2.7, GREEN]); }
        let s = X(16, 28, T('캐시 없이 매번 전부 계산한다면 (단순 계산)', 'Recomputing everything each step (simple arithmetic)'), { s: 15, a: 'start', w: 700 });
        s += R(16, 40, 488, 44, 'none', RULE, 1, 3) + parts(40, nc);
        s += X(16, 124, T('캐시 사용 (논문 표 I)', 'With caching (paper Table I)'), { s: 15, a: 'start', w: 700 });
        s += R(16, 136, 488, 44, 'none', RULE, 1, 3) + parts(136, c);
        if (head >= 73) s += X(sx(73) + 8, 164, '73 ms', { s: 17, a: 'start', f: GREEN, w: 800 });
        if (head >= total) s += X(504, 72 - 40, '361 ms', { s: 17, a: 'end', f: ORANGE, w: 800 });
        const lg = [[INK2, T('이미지 인코더 14', 'image encoder 14')], [BLUE, T('관측 순전파 32', 'observation pass 32')], [GREEN, T('행동 순전파 2.7', 'action pass 2.7')]];
        lg.forEach(([col, tx], i) => { const x = 16 + i * 170; s += `<rect x="${x}" y="216" width="14" height="14" rx="3" fill="${col}"/>` + X(x + 20, 228, tx, { s: 13, a: 'start', f: INK2 }); });
        return {
          svg: s,
          step: pick(t, [
            [0, T('적분은 10번이지만 그동안 이미지와 명령은 바뀌지 않는다.', 'Integration runs ten times, yet the image and the command never change during it.')],
            [1.2, T('캐시가 없다면 같은 이미지와 언어를 열 번 다시 읽게 된다.', 'Without a cache, the same image and text would be processed ten times.')],
            [4, T('캐시를 쓰면 관측은 한 번만 계산해 Key와 Value를 저장하고, 작은 action expert만 반복한다.', 'With a cache, observations are computed once, their Keys and Values are stored, and only the small action expert repeats.')],
            [8, T('앞의 마스크 덕분에 가능한 일이다. 앞쪽 토큰의 결과가 τ에 의존하지 않기 때문이다.', 'The mask makes this possible, because the early tokens do not depend on τ.')],
          ]),
        };
      },
    },

    // Part 4: what shrank and what did not.
    shrink: {
      h: 300, dur: 14,
      title: T('무엇을 작게 만들었나', 'What was made smaller'),
      draw(t) {
        const px = (m) => (m / 3300) * 480, v = lerp(3000, 350, seg(t, 1.8, 4)), e = lerp(300, 100, seg(t, 4.4, 5.8));
        let s = X(20, 24, t < 1.8 ? 'π0' : 'SmolVLA', { s: 16, a: 'start', w: 800, f: BLUE }) + X(500, 24, (v + e >= 1000 ? ((v + e) / 1000).toFixed(1) + 'B' : Math.round(v + e) + 'M'), { s: 16, a: 'end', w: 800 });
        s += `<rect x="20" y="36" width="${px(v)}" height="38" fill="${BLUE}" opacity="0.8"/><rect x="${20 + px(v) + 2}" y="36" width="${px(e)}" height="38" fill="${GREEN}" opacity="0.85"/>`;
        s += KEY(20, 94, [[0, BLUE, 'VLM'], [66, GREEN, 'action expert']]) + X(500, 94, T('길이는 파라미터 수에 비례', 'length follows parameter count'), { s: 13, a: 'end', f: INK2 });
        const panel = (x, title, o) => X(x + 70, 130, title, { s: 14, w: 700, o });
        const o1 = seg(t, 6.2, 7), o2 = seg(t, 8.6, 9.4), o3 = seg(t, 11, 11.8);
        s += panel(20, T('시각 토큰', 'Visual tokens'), o1);
        const m = seg(t, 7.2, 8.4), cell = lerp(5, 11, m), cnt = Math.round(lerp(24, 8, m));
        const gs = (140 - cnt * cell) / 2;
        for (let i = 0; i < cnt; i++) for (let j = 0; j < Math.min(cnt, 22); j++) {
          if (cell * cnt > 140 && (i * cell > 130 || j * cell > 130)) continue;
          s += `<rect x="${20 + Math.max(0, gs) + i * cell}" y="${142 + j * Math.min(cell, 6.2 + m * 4.8)}" width="${cell - 1}" height="${Math.min(cell, 6.2 + m * 4.8) - 1}" fill="${BLUE}" opacity="${0.6 * o1}"/>`;
        }
        s += X(90, 288, m < 1 ? '' : T('프레임당 64개', '64 per frame'), { s: 14, w: 600, f: BLUE, o: o1 });
        s += panel(190, T('VLM 층', 'VLM layers'), o2);
        const layers = 8, used = 8 - Math.round(4 * seg(t, 9.6, 10.6));
        for (let i = 0; i < layers; i++) s += `<rect x="${215}" y="${142 + i * 14}" width="90" height="10" rx="2" fill="${i < used ? BLUE : 'none'}" stroke="${i < used ? 'none' : RULE}" opacity="${(i < used ? 0.75 : 1) * o2}"/>`;
        s += X(260, 288, used === 4 ? T('앞쪽 절반만', 'first half only') : '', { s: 14, w: 600, f: BLUE, o: o2 });
        s += panel(360, T('행동 chunk', 'Action chunk'), o3);
        s += X(430, 205, '50', { s: 38, w: 800, f: GREEN, o: o3 }) + X(430, 240, T('π0와 같은 길이', 'same as π0'), { s: 14, f: INK2, o: o3 });
        return {
          svg: s,
          step: pick(t, [
            [0, T('π0의 규모다. VLM이 약 3B, action expert가 약 300M이다.', 'This is π0: a VLM of about 3B and an action expert of about 300M.')],
            [1.8, T('가장 크게 줄어든 곳은 VLM이다. PaliGemma를 SmolVLM-2로 바꾼다.', 'The largest cut is the VLM, swapping PaliGemma for SmolVLM-2.')],
            [4.4, T('action expert도 약 100M으로 줄인다. VLM만 바꾼 모델이 아니다.', 'The action expert shrinks to about 100M too, so this is more than a VLM swap.')],
            [6.2, T('파라미터 외에 연산량도 줄인다. 타일링 없이 전체 이미지 하나를 쓰고 pixel shuffle로 토큰을 묶는다.', 'Compute shrinks as well as parameters. A single global image plus pixel shuffle reduces the token count.')],
            [8.6, T('VLM의 층도 앞쪽 절반만 쓴다.', 'Only the first half of the VLM layers is used.')],
            [11, T('한 번에 예측하는 행동 수는 줄이지 않았다. 모델 크기와 chunk 길이는 별개의 선택이다.', 'The number of predicted actions did not shrink. Model size and chunk length are separate choices.')],
          ]),
        };
      },
    },

    // Part 4: sync vs async, simulated with a queue of ten actions.
    async: (function () {
      const N = 40, LAT = 4, n = 10, G = 0.5, sim = (async) => {
        let q = n, srv = 0, exec = 0, wait = 0; const out = [];
        for (let k = 0; k < N; k++) {
          let waiting = false;
          if (q > 0) { q--; exec++; } else { wait++; waiting = true; }
          if (!async && q === 0 && srv === 0 && !waiting) srv = LAT + 1;
          if (async && srv === 0 && q / n < G) srv = LAT + 1;
          if (srv > 0) { srv--; if (srv === 0) q = n; }
          out.push({ q, srv, exec, wait, waiting });
        }
        return out;
      };
      const S = sim(false), Z = sim(true);
      return {
        h: 270, dur: 16.5,
        title: T('로봇을 멈추지 않고 다음 chunk 계산하기', 'Computing the next chunk without stopping the robot'),
        draw(t) {
          const k = clamp(Math.floor(t / 0.4), 0, N - 1), lane = (y, title, a) => {
            const c = a[k];
            let s = X(16, y, title, { s: 15, a: 'start', w: 700 });
            s += X(504, y, T(`실행 ${c.exec}, 대기 ${c.wait}`, `${c.exec} executed, ${c.wait} waiting`), { s: 15, a: 'end', w: 700, f: c.wait ? ORANGE : GREEN });
            for (let i = 0; i < n; i++) s += R(16 + i * 34, y + 12, 28, 40, i < c.q ? GS : 'none', i < c.q ? GREEN : RULE, 1, 4);
            s += L(16 + n * 34 + 2, y + 12, 16 + n * 34 + 2, y + 52, BLUE, 1.5, 0.6);
            if (c.srv > 0) s += B(372, y + 14, 132, 36, T('서버: 추론 중', 'server: inferring'), { f: BS, s: BLUE, size: 13 });
            else if (c.waiting) s += B(372, y + 14, 132, 36, T('로봇 대기', 'robot waits'), { f: 'none', s: ORANGE, c: ORANGE, size: 13 });
            else s += B(372, y + 14, 132, 36, T('로봇 실행', 'robot moves'), { size: 13, c: INK2, weight: 400 });
            return s;
          };
          let s = lane(24, T('동기: 다 쓰면 계산', 'Sync: compute when empty'), S);
          s += lane(120, T('비동기: 줄어들면 미리 계산', 'Async: compute ahead of time'), Z);
          const gx = 16 + 5 * 34 - 3;
          s += L(gx, 132, gx, 176, ORANGE, 2, 1, '4 3') + X(gx, 198, 'g = 0.5', { s: 14, f: ORANGE, w: 600 });
          s += X(16, 250, T('칸 하나가 행동 하나. 왼쪽부터 찬 칸이 큐에 남은 행동이다.', 'Each cell is one action. Filled cells are actions left in the queue.'), { s: 13, a: 'start', f: INK2 });
          return {
            svg: s,
            step: pick(t, [
              [0, T('두 로봇 모두 chunk 10개를 받아 시간 순서대로 실행한다.', 'Both robots receive a chunk of ten actions and run them in order.')],
              [3.5, T('동기 쪽은 큐가 비어야 추론을 시작하고, 끝날 때까지 로봇이 서 있다.', 'The sync robot starts inference only once the queue is empty, and stands still until it finishes.')],
              [6.5, T('비동기 쪽은 큐가 임계값 g 아래로 내려가면 관측을 보내고, 움직이는 동안 서버가 계산한다.', 'The async robot sends an observation when the queue drops below g, and the server computes while it moves.')],
              [11, T('그 대가로 새 chunk는 몇 스텝 전의 관측으로 계산된 것이다. 그 사이 장면이 바뀌었다면 오래된 정보가 된다.', 'The cost is that the new chunk was computed from an observation a few steps old, which may be stale.')],
              [14, T('이것은 학습 알고리즘이 아니라 실행 시스템의 설계다.', 'This is an execution-system design, not a training algorithm.')],
            ]),
          };
        },
      };
    })(),

    // Bonus: System 2 re-reads the scene at 10 Hz, System 1 acts at 120 Hz.
    clock: {
      h: 236, dur: 10.5,
      title: T('느린 이해, 빠른 움직임', 'Slow understanding, fast motion'),
      draw(t) {
        const ms = seg(t, 0.6, 8.6) * 500, x = (m) => 40 + (m / 500) * 460;
        const reads = ms > 0 ? Math.min(5, Math.floor(ms / 100) + 1) : 0;
        const acts = ms > 0 ? Math.min(60, Math.floor((ms * 120) / 1000) + 1) : 0;
        let s = X(40, 28, 'System 2 · VLM · 10 Hz', { s: 14, a: 'start', w: 700, f: BLUE });
        s += X(500, 28, T(`읽기 ${reads}회`, `${reads} reads`), { s: 14, a: 'end', w: 700, f: BLUE });
        s += X(40, 126, T('System 1 · 행동 · 120 Hz', 'System 1 · actions · 120 Hz'), { s: 14, a: 'start', w: 700, f: GREEN });
        s += X(500, 126, T(`행동 ${acts}개`, `${acts} actions`), { s: 14, a: 'end', w: 700, f: GREEN });
        for (let k = 0; k < 5; k++) {
          const m = k * 100;
          if (ms > m) s += B(x(m) + 2, 40, x(100) - x(0) - 6, 34, T('다시 읽기', 're-read'), { f: BS, s: BLUE, size: 12.5 });
        }
        for (let k = 0; k < 60; k++) { const m = (k * 1000) / 120; if (ms > m) s += L(x(m), 140, x(m), 172, GREEN, 2.2); }
        s += L(40, 192, 500, 192, RULE, 1.5);
        for (let k = 0; k <= 5; k++) s += X(x(k * 100), 212, k * 100 + ' ms', { s: 12, f: INK2 });
        if (ms > 0 && ms < 500) s += L(x(ms), 36, x(ms), 180, INK, 1.5, 0.7);
        return {
          svg: s,
          step: pick(t, [
            [0, T('GR00T N1은 이해와 움직임을 다른 속도로 돌린다. 0.5초 동안을 따라가 보자.', 'GR00T N1 runs understanding and motion at different speeds. Follow half a second.')],
            [0.8, T('System 2(VLM)는 0.1초마다 카메라 이미지와 명령을 다시 읽는다. 논문 기준으로 L40 GPU에서 10Hz다.', 'System 2, the VLM, re-reads the camera image and the instruction every 0.1 s. That is 10 Hz on an L40 GPU in the paper.')],
            [3.6, T('System 1은 그 사이에도 초당 120개의 속도로 행동을 내놓는다.', 'In between, System 1 keeps producing actions at 120 per second.')],
            [8.6, T('0.5초 동안 장면은 다섯 번 읽고, 행동은 60개를 낸다. 느린 이해와 빠른 움직임을 나눈 설계다.', 'In half a second it reads the scene five times and emits sixty actions. Slow understanding and fast motion are split apart.')],
          ]),
        };
      },
    },

    // Bonus: pi0 pairs layers, GR00T hands over one set of VLM tokens.
    couple: {
      h: 290, dur: 13,
      title: T('VLM과 행동 모델이 만나는 위치', 'Where the VLM meets the action model'),
      draw(t) {
        const ly = (i) => 58 + i * 46, lh = 32;
        let s = X(130, 26, 'π0', { s: 16, w: 800 }) + X(390, 26, 'GR00T N1', { s: 16, w: 800 });
        s += L(260, 14, 260, 282, RULE, 1.5);
        for (let i = 0; i < 4; i++) {
          const a = 0.6 + i * 0.7, on = t >= a;
          s += B(22, ly(i), 86, lh, T(`VLM ${i + 1}층`, `VLM L${i + 1}`), { f: on ? BS : PAPER, s: on ? BLUE : RULE, size: 13 });
          s += B(150, ly(i), 86, lh, T(`행동 ${i + 1}층`, `action L${i + 1}`), { f: on ? GS : PAPER, s: on ? GREEN : RULE, size: 13 });
          if (on) s += A(110, ly(i) + lh / 2, 147, ly(i) + lh / 2, BLUE, 2, seg(t, a, a + 0.4));
        }
        s += X(130, 266, T('층마다 같은 깊이의 VLM을 읽는다', 'each layer reads the VLM at the same depth'), { s: 12.5, f: INK2 });
        const v0 = 3.6, d0 = 6.4;
        for (let i = 0; i < 4; i++) {
          const on = t >= v0 + i * 0.5;
          s += B(272, ly(i), 70, lh, `VLM ${i + 1}`, { f: on ? BS : PAPER, s: on ? BLUE : RULE, size: 13 });
        }
        const mem = t >= v0 + 2.1;
        s += R(354, 126, 62, 66, mem ? BS : PAPER, mem ? BLUE : RULE, 1, RX, mem ? '' : '4 4');
        s += X(385, 154, T('넘긴', 'handed'), { s: 12, f: mem ? INK : INK2 }) + X(385, 170, T('토큰', 'tokens'), { s: 12, f: mem ? INK : INK2 });
        if (mem) s += A(342, ly(3) + lh / 2, 356, 194, BLUE, 1.8, seg(t, v0 + 2.1, v0 + 2.5));
        for (let i = 0; i < 4; i++) {
          const ca = i % 2 === 0, a = d0 + i * 0.7, on = t >= a;
          s += B(428, ly(i), 80, lh, ca ? 'Cross-attn' : 'Self-attn', { f: on ? GS : PAPER, s: on ? GREEN : RULE, size: 12.5 });
          if (ca && on) s += A(416, 159, 427, ly(i) + lh / 2, BLUE, 1.8, seg(t, a, a + 0.4));
        }
        s += X(390, 266, T('cross-attn 층이 모두 같은 토큰을 읽는다', 'every cross-attn layer reads the same tokens'), { s: 12.5, f: INK2 });
        return {
          svg: s,
          step: pick(t, [
            [0, T('π0: 가중치는 따로지만 두 쪽이 한 트랜스포머 안에 있다. 층마다 행동 토큰이 같은 층의 VLM 토큰을 attention으로 읽는다.', 'π0: separate weights, one transformer. At every layer the action tokens attend to the VLM tokens of that same layer.')],
            [3.6, T('GR00T N1: VLM이 먼저 계산을 끝낸다. 마지막 층이 아니라 LLM의 12번째 층 출력을 넘긴다.', 'GR00T N1: the VLM finishes first, and hands over the output of LLM layer 12 rather than the last layer.')],
            [6.4, T('System 1의 DiT는 cross-attention 층에서 넘겨받은 토큰을 Key와 Value로 읽고, self-attention 층에서는 행동 토큰과 로봇 상태끼리 본다.', 'System 1, a DiT, reads those tokens as Keys and Values in its cross-attention layers, and attends among action and state tokens in its self-attention layers.')],
            [9.8, T('비유하면 π0는 두 전문가가 같은 회의에 앉은 구조이고, GR00T는 정리된 자료를 넘겨받는 구조다.', 'Put simply, π0 seats both experts in one meeting, while GR00T hands one of them a finished brief.')],
          ]),
        };
      },
    },

    // Bonus: one shared DiT, small per-body adapters around it.
    embody: {
      h: 270, dur: 13.6,
      title: T('몸이 달라도 같은 System 1', 'One System 1 for different bodies'),
      draw(t) {
        const list = ko
          ? [['단일 팔 로봇', '관절과 그리퍼'], ['양팔 로봇', '팔 두 개의 관절'], ['휴머노이드 GR-1', '팔, 손, 허리'], ['사람 영상', '행동 라벨 없음, 잠재 행동으로 대신']]
          : [['Single-arm robot', 'joints and gripper'], ['Bimanual robot', 'two arms of joints'], ['GR-1 humanoid', 'arms, hands and waist'], ['Human video', 'no action labels, latent actions instead']];
        const cols = [[BLUE, BS], [GREEN, GS], [ORANGE, 'none'], [BLUE, BS]];
        const k = clamp(Math.floor(t / 3.2), 0, 3), u = t - k * 3.2, sl = seg(u, 0.1, 0.8), [c, cs] = cols[k];
        let s = X(260, 30, list[k][0], { s: 18, w: 800 }) + X(260, 54, list[k][1], { s: 13, f: INK2 });
        s += B(194, 104, 132, 76, T('공유 DiT', 'Shared DiT'), { s: INK2, size: 15 });
        s += X(260, 202, T('모든 몸의 데이터로 함께 학습', 'trained on every body together'), { s: 12.5, f: INK2 });
        const ex = lerp(-130, 30, sl), dx = lerp(530, 370, sl);
        s += B(ex, 92, 124, 38, T('상태 인코더', 'state encoder'), { f: cs, s: c, size: 13 });
        s += B(ex, 146, 124, 38, T('행동 인코더', 'action encoder'), { f: cs, s: c, size: 13 });
        s += B(dx, 123, 124, 38, T('행동 디코더', 'action decoder'), { f: cs, s: c, size: 13 });
        if (sl >= 1) s += A(156, 111, 192, 130, c, 1.8) + A(156, 165, 192, 154, c, 1.8) + A(328, 142, 368, 142, c, 1.8);
        s += X(260, 246, T('바뀌는 것은 바깥의 작은 MLP뿐', 'only the small MLPs outside change'), { s: 13.5, w: 600, f: c });
        return {
          svg: s,
          step: pick(t, [
            [0, T('System 1의 가운데인 DiT는 모든 로봇이 함께 쓴다. 로봇마다 따로 두는 것은 바깥의 인코더와 디코더다.', 'The DiT at the core of System 1 is shared by every robot. Only the encoders and decoder around it are per robot.')],
            [3.2, T('양팔 로봇은 상태와 행동의 차원이 다르다. 작은 MLP만 바꿔 끼우면 같은 DiT를 쓴다.', 'A bimanual robot has different state and action dimensions. Swapping the small MLPs lets it use the same DiT.')],
            [6.4, T('휴머노이드도 마찬가지다. π0처럼 큰 차원으로 0을 채워 맞추는 대신, 몸마다 투영층을 둔다.', 'The humanoid works the same way. Instead of zero-padding to one large size as π0 does, each body gets its own projection.')],
            [9.6, T('행동 라벨이 없는 사람 영상에는 잠재 행동을 붙여, 하나의 "몸"처럼 취급한다.', 'Human video has no action labels, so it gets latent actions and is treated as one more "body".')],
          ]),
        };
      },
    },

    // Bonus: the data pyramid, latent actions and neural trajectories.
    pyramid: {
      h: 300, dur: 14.5,
      title: T('데이터 피라미드', 'The data pyramid'),
      draw(t) {
        const hw = (y) => 34 + ((y - 30) / 240) * 100, cx = 140;
        const lv = ko
          ? [['실제 로봇 데이터', 190, 270, BLUE], ['시뮬레이션 · 생성 영상', 110, 190, GREEN], ['웹 데이터 · 사람 영상', 30, 110, ORANGE]]
          : [['Real robot data', 190, 270, BLUE], ['Simulation · neural video', 110, 190, GREEN], ['Web data · human video', 30, 110, ORANGE]];
        let s = '';
        // Bottom is the widest: draw the pyramid upside down in data terms, base = web.
        const tiers = [[lv[2], 190, 270], [lv[1], 110, 190], [lv[0], 30, 110]];
        tiers.forEach(([[name, , , col], y1, y2], i) => {
          const o = seg(t, 0.3 + i * 0.7, 0.9 + i * 0.7);
          s += `<path d="M${cx - hw(y1)} ${y1}L${cx + hw(y1)} ${y1}L${cx + hw(y2)} ${y2}L${cx - hw(y2)} ${y2}Z" fill="${col}" opacity="${0.18 * o}" stroke="${col}" stroke-width="1.4" stroke-opacity="${o}"/>`;
          s += X(cx, (y1 + y2) / 2 + 5, name, { s: 13, w: 600, o });
        });
        s += X(cx, 292, T('위로 갈수록 양은 적고 로봇에 특화', 'scarcer and more robot-specific toward the top'), { s: 12, f: INK2 });
        const o2 = seg(t, 3.6, 4.4);
        if (t >= 3.6) {
          s += X(290, 36, T('라벨 없는 영상 → 잠재 행동', 'unlabeled video → latent actions'), { s: 13.5, a: 'start', w: 700, o: o2 });
          s += B(290, 50, 56, 40, 'x', { o: o2, size: 14 }) + B(352, 50, 56, 40, 'x+H', { o: o2, size: 13 });
          s += A(410, 70, 430, 70, INK2, 1.6, o2) + B(432, 50, 72, 40, 'VQ-VAE', { f: BS, s: BLUE, o: o2, size: 13 });
          const o3 = seg(t, 5.2, 5.9);
          s += A(468, 92, 468, 112, BLUE, 1.6, o3) + B(398, 114, 106, 36, T('잠재 행동 z', 'latent action z'), { f: GS, s: GREEN, o: o3, size: 13 });
        }
        if (t >= 8.4) {
          const o4 = seg(t, 8.4, 9.1), g = seg(t, 9.4, 11.8), W = 200 / 827.3;
          s += X(290, 186, T('생성 영상으로 데이터 늘리기', 'growing data with generated video'), { s: 13.5, a: 'start', w: 700, o: o4 });
          s += X(290, 214, T('실제 원격조작', 'real teleop'), { s: 12.5, a: 'start', f: INK2, o: o4 });
          s += `<rect x="290" y="220" width="${88.4 * W}" height="14" rx="3" fill="${BLUE}" opacity="${o4}"/>` + X(296 + 88.4 * W, 232, T('88시간', '88 h'), { s: 12.5, a: 'start', w: 700, o: o4 });
          s += X(290, 258, T('신경망 궤적', 'neural trajectories'), { s: 12.5, a: 'start', f: INK2, o: o4 });
          s += `<rect x="290" y="264" width="${Math.max(1, 827.3 * W * g)}" height="14" rx="3" fill="${GREEN}" opacity="${o4}"/>`;
          if (g > 0.05) s += X(500, 258, T(`${Math.round(88 + (827 - 88) * g)}시간`, `${Math.round(88 + (827 - 88) * g)} h`), { s: 12.5, a: 'end', w: 700 });
        }
        return {
          svg: s,
          step: pick(t, [
            [0, T('GR00T N1은 데이터를 세 층으로 쌓는다. 아래는 양이 많고 범용적이며, 위로 갈수록 적고 로봇에 특화된다.', 'GR00T N1 stacks data in three tiers. The base is large and general; toward the top it gets scarcer and more robot-specific.')],
            [3.6, T('사람 영상에는 행동 라벨이 없다. 두 프레임 사이의 변화를 VQ-VAE로 압축한 "잠재 행동"을 라벨로 쓴다.', 'Human video has no action labels. The change between two frames, compressed by a VQ-VAE, becomes a "latent action" label.')],
            [8.4, T('실제 GR-1 원격조작 약 88시간을 영상 생성 모델로 불려 약 827시간의 "신경망 궤적"을 만들었다.', 'About 88 hours of real GR-1 teleoperation were expanded by a video generation model into about 827 hours of "neural trajectories".')],
            [12, T('생성 영상의 행동은 잠재 행동이나, 두 프레임에서 행동을 추정하는 역동역학 모델(IDM)로 붙인다.', 'Actions for the generated videos come from latent actions or from an inverse dynamics model that infers actions from two frames.')],
          ]),
        };
      },
    },
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOLD = 1.6;

  function mount(el) {
    const scene = SCENES[el.dataset.anim];
    if (!scene) return;
    el.innerHTML = `<p class="a-title">${scene.title}</p>
      <svg viewBox="0 0 520 ${scene.h}" role="img" aria-label="${scene.title.replace(/"/g, '&quot;')}"></svg>
      <p class="a-step"></p>
      <div class="a-ctl"><button type="button"></button><input type="range" min="0" max="${scene.dur}" step="0.05" aria-label="${T('진행 위치', 'Position')}"></div>`;
    const svg = el.querySelector('svg'), step = el.querySelector('.a-step');
    const btn = el.querySelector('button'), range = el.querySelector('input');
    let t = reduce ? scene.dur : 0, playing = !reduce, visible = false, last = 0, drawn = 0, rafId = 0;

    const paint = () => {
      const f = scene.draw(Math.min(t, scene.dur));
      svg.innerHTML = f.svg;
      if (step.textContent !== f.step) step.textContent = f.step;
      range.value = Math.min(t, scene.dur);
    };
    const label = () => { btn.textContent = playing ? T('일시정지', 'Pause') : T('재생', 'Play'); };
    const tick = (now) => {
      rafId = 0;
      if (!visible || !playing) return;
      const dt = Math.min(0.1, (now - last) / 1000 || 0);
      last = now;
      t += dt;
      if (t > scene.dur + HOLD) t = 0;
      if (now - drawn > 30) { paint(); drawn = now; }
      rafId = requestAnimationFrame(tick);
    };
    const run = () => { if (!rafId && visible && playing) { last = performance.now(); rafId = requestAnimationFrame(tick); } };

    btn.addEventListener('click', () => {
      playing = !playing;
      if (playing && t >= scene.dur) t = 0;
      label();
      run();
    });
    range.addEventListener('input', () => { playing = false; t = +range.value; label(); paint(); });
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; run(); }, { threshold: 0.25 }).observe(el);
    label();
    paint();
  }

  // The flow in every post's hero. It runs for a few seconds and then settles,
  // so nothing keeps moving behind the text.
  const part = document.documentElement.dataset.part;
  const heroEl = document.querySelector('.hero');
  if (heroEl && part) {
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    heroEl.prepend(cv);
    const ctx = cv.getContext('2d'), r = rng(23);
    const pts = Array.from({ length: 300 }, () => ({ y: r(), up: r() < 0.5, off: r(), sp: 0.7 + r() * 0.5, j: r() - 0.5 }));
    const css = getComputedStyle(document.documentElement);
    const c1 = css.getPropertyValue('--blue').trim(), c2 = css.getPropertyValue('--green').trim();
    let W = 0, H = 0;
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = heroEl.clientWidth; H = heroEl.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const paintFlow = (t) => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        const q = (t * 0.07 * p.sp + p.off) % 1;
        const x = q * W, m = smooth(q);
        const dest = (p.up ? 0.3 : 0.72) + p.j * 0.05;
        const y = lerp(p.y, dest, m) * H;
        ctx.globalAlpha = (0.12 + 0.62 * q) * Math.min(1, (1 - q) * 9) * Math.min(1, q * 12);
        ctx.fillStyle = p.up ? c1 : c2;
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + q * 1.8, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    size();
    window.addEventListener('resize', () => { size(); paintFlow(24); });
    if (reduce) paintFlow(24);
    else {
      const t0 = performance.now();
      const loop = (now) => {
        const t = (now - t0) / 1000;
        paintFlow(6 + Math.min(t, 18));
        if (t < 18) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  document.querySelectorAll('figure.anim[data-anim]').forEach(mount);
})();
