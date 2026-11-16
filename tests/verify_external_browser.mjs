export default async function run({ page, assert }) {
  await new Promise(r => setTimeout(r, 1200));

  const results = await page.evaluate(async () => {
    const logs = [];

    // 1. 模擬 Android 環境測試 Intent 派發
    const origUserAgent = navigator.userAgent;
    let assignedHref = '';

    // Mock Android UA
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 15; Pixel 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
      configurable: true
    });

    // 攔截 openExternalBrowserUrl 中的 window.location.href 賦值
    const testIntentTarget = (charIdx) => {
      const url = CHARACTER_TARGET_URLS[charIdx];
      const noProto = url.replace(/^https?:\/\//, '');
      return `intent://${noProto}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    };

    // 測試函式直接呼叫與卡片點擊觸發
    const testChar = (charIdx) => {
      const portal = {
        charIdx: charIdx,
        asset: { patternColor: '#ff0000' }
      };
      startPortalEnterTransition(portal);
    };

    const overlay = document.getElementById('portal-transition-overlay');
    const badge = document.getElementById('transition-badge');
    const container = document.getElementById('subapp-frame-container');

    // 測試 A：麻糬紅豆湯 (idx 3)
    let triggeredIntent = '';
    const origOpenExt = openExternalBrowserUrl;
    openExternalBrowserUrl = (url) => {
      const noProto = url.replace(/^https?:\/\//, '');
      triggeredIntent = `intent://${noProto}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    };

    testChar(3);
    const expectedMochiIntent = testIntentTarget(3);
    const mochiPassed = triggeredIntent === expectedMochiIntent && container.children.length === 0 && badge.style.display !== 'block';
    logs.push({
      char: '麻糬紅豆湯 (idx 3) Android Intent 檢驗',
      passed: mochiPassed,
      intent: triggeredIntent
    });

    // 測試 B：玉子燒握壽司 (idx 6)
    triggeredIntent = '';
    testChar(6);
    const expectedTamagoIntent = testIntentTarget(6);
    const tamagoPassed = triggeredIntent === expectedTamagoIntent && container.children.length === 0 && badge.style.display !== 'block';
    logs.push({
      char: '玉子燒握壽司 (idx 6) Android Intent 檢驗',
      passed: tamagoPassed,
      intent: triggeredIntent
    });

    // 測試 C：蘆筍手捲 (idx 12)
    triggeredIntent = '';
    testChar(12);
    const expectedWorkoutIntent = testIntentTarget(12);
    const workoutPassed = triggeredIntent === expectedWorkoutIntent && container.children.length === 0 && badge.style.display !== 'block';
    logs.push({
      char: '蘆筍手捲 (idx 12) Android Intent 檢驗',
      passed: workoutPassed,
      intent: triggeredIntent
    });

    // 還原 openExternalBrowserUrl
    openExternalBrowserUrl = origOpenExt;

    // 測試 D：鮭魚握壽司 (idx 1) - 內嵌子應用 (觸發 blocking 轉場)
    testChar(1);
    const salmonPassed = overlay.classList.contains('blocking') && isTransitioning === true;
    logs.push({
      char: '鮭魚握壽司 (idx 1) 內嵌過渡檢驗',
      passed: salmonPassed
    });
    restorePortalDirect();

    // 測試 E：未設定角色 (idx 0 抹茶紅豆聖代) - 職人準備中
    testChar(0);
    const emptyPassed = badge.style.display !== 'none' && overlay.classList.contains('blocking');
    logs.push({
      char: '未設定角色 (idx 0) 職人準備中提示檢驗',
      passed: emptyPassed
    });
    restorePortalDirect();

    return logs;
  });

  for (const log of results) {
    console.log(`[VERIFY RESULT] ${log.char} -> passed=${log.passed}`, log.intent || '');
    assert(log.passed, `Failed verification for ${log.char}`);
  }
}
