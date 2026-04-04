import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docsDir = path.join(repoRoot, 'docs');
const htmlPath = path.join(docsDir, 'index.html');
const cssPath = path.join(docsDir, 'style.css');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

function countMatches(source, regex) {
  return (source.match(regex) || []).length;
}

function getSlideBlocks(source) {
  return [...source.matchAll(/<div class="slide[\s\S]*?<\/div>\s*(?=\n<!-- ====================|\n<div class="page-number"|$)/g)].map((match) => match[0]);
}

function findSlideByHeading(headingHtml) {
  return getSlideBlocks(html).find((slide) => slide.includes(headingHtml));
}

test('initial page display matches slide count', () => {
  const slideCount = countMatches(html, /<div class="slide(?:\s|")/g);
  const pageNumber = html.match(/<div class="page-number" id="pageNumber">([^<]+)<\/div>/)?.[1]?.trim();
  const pageInfo = html.match(/<span class="page-info" id="pageInfo">([^<]+)<\/span>/)?.[1]?.trim();

  assert.equal(slideCount, 24);
  assert.equal(pageNumber, `1 / ${slideCount}`);
  assert.equal(pageInfo, `1 / ${slideCount}`);
});

test('image-enhanced slides use the expected compact layout classes', () => {
  assert.equal(countMatches(html, /slide-overview--browser/g), 1);
  assert.equal(countMatches(html, /slide-overview--schedule/g), 1);
  assert.equal(countMatches(html, /slide-overview--experience/g), 1);

  const browserSlide = findSlideByHeading('<h2>ブラウザを扱える</h2>');
  const scheduleSlide = findSlideByHeading('<h2>スケジュールで定期タスクを回せる</h2>');
  const experienceSlide = findSlideByHeading('<h2 class="no-margin">実演: 2時間で作ったサイト</h2>');

  assert.ok(browserSlide, 'browser slide not found');
  assert.ok(scheduleSlide, 'schedule slide not found');
  assert.ok(experienceSlide, 'experience slide not found');

  assert.match(browserSlide, /slide-overview--browser/);
  assert.match(scheduleSlide, /slide-overview--schedule/);
  assert.match(experienceSlide, /slide-overview--experience/);
  assert.match(experienceSlide, /experience-card--with-preview/);
});

test('local image references used by the slides exist on disk', () => {
  const localImageRefs = [...html.matchAll(/<img[^>]+src="([^":]+)"/g)].map((match) => match[1]);

  assert.ok(localImageRefs.length > 0, 'no local images found');

  for (const relativePath of localImageRefs) {
    const fullPath = path.join(docsDir, relativePath);
    assert.ok(fs.existsSync(fullPath), `missing local image: ${relativePath}`);
  }
});

test('beginner-facing labels are written in Japanese', () => {
  assert.doesNotMatch(html, /Copypaste OK|Try It|Ask Freely|Files|Browser|Skills|Schedule/);
  assert.match(html, /コピペOK/);
  assert.match(html, /まず触ってみる/);
  assert.match(html, /気軽に質問/);
  assert.match(html, /ファイル/);
  assert.match(html, /ブラウザ/);
  assert.match(html, /スキル/);
  assert.match(html, /定期実行/);
});

test('compact slide CSS hooks are defined', () => {
  assert.match(css, /\.slide-overview--browser/);
  assert.match(css, /\.slide-overview--schedule/);
  assert.match(css, /\.slide-overview--experience/);
  assert.match(css, /\.experience-card--with-preview/);
  assert.match(css, /\.site-preview--inline/);
});
