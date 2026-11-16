export default async function run({ page, assert }) {
  await new Promise(r => setTimeout(r, 1200));

  const results = await page.evaluate(async () => {
    const logs = [];
    const openedUrls = [];

    // Mock window.open
    window.open = (url, target, features) => {
      openedUrls.push({ url, target, features });
      return { closed: false };
    };

    // Helper to test character click
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

    // 1. 麻糬紅豆湯 (idx 3) -> 強制外部開啟
    openedUrls.length = 0;
    testChar(3);
    const mUrl = openedUrls[0]?.url;
    const mExternal = openedUrls.length === 1 && mUrl === 'https://bard0228.github.io/pitchlab/';
    const mContainerEmpty = container.children.length === 0;
    const mBadgeNone = badge.style.display !== 'block';
    const mNoBlocking = !overlay.classList.contains('blocking');
    logs.push({
      char: '麻糬紅豆湯 (idx 3)',
      passed: mExternal && mContainerEmpty && mBadgeNone && mNoBlocking,
      openedUrl: mUrl,
      mExternal,
      mContainerEmpty,
      mBadgeNone,
      mNoBlocking
    });

    // 2. 玉子燒握壽司 (idx 6) -> 強制外部開啟
    openedUrls.length = 0;
    testChar(6);
    const tUrl = openedUrls[0]?.url;
    const tExternal = openedUrls.length === 1 && tUrl === 'https://bard0228.github.io/lovetravel/';
    const tContainerEmpty = container.children.length === 0;
    const tBadgeNone = badge.style.display !== 'block';
    const tNoBlocking = !overlay.classList.contains('blocking');
    logs.push({
      char: '玉子燒握壽司 (idx 6)',
      passed: tExternal && tContainerEmpty && tBadgeNone && tNoBlocking,
      openedUrl: tUrl,
      tExternal,
      tContainerEmpty,
      tBadgeNone,
      tNoBlocking
    });

    // 3. 蘆筍手捲 (idx 12) -> 強制外部開啟
    openedUrls.length = 0;
    testChar(12);
    const wUrl = openedUrls[0]?.url;
    const wExternal = openedUrls.length === 1 && wUrl === 'https://bard0228.github.io/workout/';
    const wContainerEmpty = container.children.length === 0;
    const wBadgeNone = badge.style.display !== 'block';
    const wNoBlocking = !overlay.classList.contains('blocking');
    logs.push({
      char: '蘆筍手捲 (idx 12)',
      passed: wExternal && wContainerEmpty && wBadgeNone && wNoBlocking,
      openedUrl: wUrl,
      wExternal,
      wContainerEmpty,
      wBadgeNone,
      wNoBlocking
    });

    // 4. 鮭魚握壽司 (idx 1) - 內嵌子應用 (不走外部開啟，觸發 blocking 轉場過渡)
    openedUrls.length = 0;
    testChar(1);
    const sNotExternal = openedUrls.length === 0 && overlay.classList.contains('blocking');
    logs.push({
      char: '鮭魚握壽司 (idx 1) 內嵌轉場',
      passed: sNotExternal,
      openedUrlsCount: openedUrls.length,
      blocking: overlay.classList.contains('blocking')
    });
    restorePortalDirect();

    // 5. 未設定網址 (idx 0 抹茶紅豆聖代) - 職人準備中徽章
    testChar(0);
    const bDisplay = badge.style.display !== 'none' && overlay.classList.contains('blocking');
    logs.push({
      char: '未設定角色 (idx 0) 職人準備中',
      passed: bDisplay,
      badgeDisplay: badge.style.display
    });
    restorePortalDirect();

    return logs;
  });

  for (const log of results) {
    console.log(`[VERIFY ITEM] ${log.char} -> passed=${log.passed}`);
    assert(log.passed, `Check failed for ${log.char}: ${JSON.stringify(log)}`);
  }
}
