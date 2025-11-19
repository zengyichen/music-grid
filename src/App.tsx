import type { Component } from 'solid-js'
import { ErrorBoundary, Show, createSignal, onMount, onCleanup } from 'solid-js'
import { createStore } from 'solid-js/store'
import dom2img from 'dom-to-image'
import { Footer } from './components/Footer'
import { GridShow } from './components/GridShow'
import { SearchPanel } from './components/SearchPanel/panel'
import type { MayBeSong } from './utils/types'
import './index.css'
import { Download } from './components/Download'

const TYPES = [
  '蓝色',
  '黄色',
  '红色',
  '黑色',
  '白色',
  '橙色',
  '粉色',
  '紫色',
  '绿色',
]

// 9 light color classes matching the `TYPES` above (light variants so text stays readable).
const GRID_COLORS: string[] = [
  'bg-blue-200',
  'bg-yellow-200',
  'bg-red-200',
  'bg-neutral-700',
  'bg-gray-70',
  'bg-orange-200',
  'bg-pink-200',
  'bg-purple-200',
  'bg-green-200',
]

// Mapping of CSS class names to hex colors for color picker
const COLOR_CLASS_TO_HEX: Record<string, string> = {
  'bg-blue-200': '#bfdbfe',
  'bg-yellow-200': '#fef08a',
  'bg-red-200': '#fecaca',
  'bg-neutral-700': '#404040',
  'bg-gray-70': '#f3f4f6',
  'bg-orange-200': '#fed7aa',
  'bg-pink-200': '#fbcfe8',
  'bg-purple-200': '#e9d5ff',
  'bg-green-200': '#bbf7d0',
}

// Convert color (hex or class name) to hex for color picker
function toHexColor(color?: string): string | undefined {
  if (!color) return undefined
  if (color.startsWith('#')) return color
  return COLOR_CLASS_TO_HEX[color]
}

// Get default background hex for a tile index using the grid palette
function defaultBgHexForIndex(index: number): string | undefined {
  const className = GRID_COLORS[index % GRID_COLORS.length]
  return toHexColor(className)
}

// Choose readable text color (black/white) based on background hex
function readableTextHex(bgHex?: string): string {
  if (!bgHex) return '#000000'
  const hex = bgHex.replace('#', '')
  if (hex.length !== 6) return '#000000'
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 140 ? '#000000' : '#ffffff'
}

// Map background color token to the text color hex used in SongShown's class logic
const TEXT_HEX_BY_TOKEN: Record<string, string> = {
  blue: '#1e40af',
  yellow: '#854d0e',
  red: '#991b1b',
  gray: '#1f2937',
  orange: '#9a3412',
  pink: '#9d174d',
  purple: '#6b21a8',
  green: '#166534',
  slate: '#ffffff',
  black: '#ffffff',
}

function initialTextHexForIndex(index: number, label: string, songTextColor?: string, songBg?: string): string {
  const customText = toHexColor(songTextColor)
  if (customText) return customText
  if (label === '黑色') return '#ffffff'
  // If a custom hex background is set but no text provided, fallback to the same class default used in component (gray-800)
  if (songBg && songBg.startsWith('#')) return '#1f2937'
  const bgClass = songBg && !songBg.startsWith('#') ? songBg : GRID_COLORS[index % GRID_COLORS.length]
  const token = Object.keys(TEXT_HEX_BY_TOKEN).find(k => bgClass.includes(k))
  return token ? TEXT_HEX_BY_TOKEN[token] : '#1f2937'
}

function setStorage(obj: MayBeSong[]) {
  if (typeof window === 'undefined')
    return
  window.localStorage.setItem('songs', JSON.stringify(obj))
}

function getStorage(): MayBeSong[] {
  if (typeof window === 'undefined')
    return
  const songStr = window.localStorage.getItem('songs') || '[]'
  return JSON.parse(songStr)
}

function sameArray<T>(s1: Array<T>, s2: Array<T>): boolean {
  const s = new Set([...s1, ...s2])
  return s.size === s1.length && s.size === s2.length
}

const ErrorFallback: Component<{
  err: any
  reset: () => void
// eslint-disable-next-line solid/no-destructure
}> = ({ err, reset }) => {
  return (
    <div class="w-1106px p-8 mx-a">
      <h1>出错啦</h1>
      <p>{String(err)}</p>
      <button class="page" onClick={reset}>重置</button>
    </div>
  )
}

const App: Component = () => {
  const [showPanel, setShowPanel] = createSignal(false)
  let cached = getStorage()
  if (cached.length === 0 || !sameArray(TYPES, cached.map(i => i.label)))
    cached = TYPES.map((i, j) => ({ label: i, type: 'label', index: j }))
  const [songs, setSongs] = createStore<MayBeSong[]>(cached)
  const [cur, setCur] = createSignal(-1)
  const [dom, setDom] = createSignal<HTMLDivElement>()
  const [img, setImg] = createSignal('')
  const [showDownload, setDownload] = createSignal(false)
  const [ma, setMa] = createSignal(true)
  const [scale, setScale] = createSignal(1)
  let containerRef: HTMLDivElement | undefined

  const updateScale = () => {
    if (!containerRef) return
    const containerWidth = containerRef.offsetWidth
    const containerHeight = containerRef.offsetHeight
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const scaleX = viewportWidth / containerWidth
    const scaleY = viewportHeight / containerHeight
    const newScale = Math.min(scaleX, scaleY, 1)
    //cconst newScale = Math.min(containerWidth, containerHeight)
    setScale(newScale)
  }

  onMount(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
  })

  onCleanup(() => {
    window.removeEventListener('resize', updateScale)
  })

  function generateCanvas(scaleFactor = 2) {
    setMa(false)
    const node = dom()
    const width = (node?.scrollWidth || node?.offsetWidth || 0)
    const height = (node?.scrollHeight || node?.offsetHeight || 0)
    dom2img.toJpeg(node!, {
      quality: 0.95,
      cacheBust: true,
      width: Math.round(width * scaleFactor),
      height: Math.round(height * scaleFactor),
      style: {
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'top left',
        width: `${width}px`,
        height: `${height}px`,
      },
    })
      .then((data) => {
        setImg(data)
        setDownload(true)
        setMa(true)
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e)
        setMa(true)
      })
  }
  return (
    <ErrorBoundary fallback={(err, reset) => <ErrorFallback err={err} reset={reset} />}>
      <div class="flex h-screen">
        <Show when={showPanel()}>
          <SearchPanel
            // eslint-disable-next-line solid/reactivity
            initialBackgroundColor={toHexColor(songs[cur()].color) ?? defaultBgHexForIndex(cur())}
            initialTextColor={initialTextHexForIndex(cur(), songs[cur()].label, songs[cur()].textColor, songs[cur()].color)}
            initialLabel={songs[cur()].label}
            onSelect={(song) => {
              setSongs(cur(), { ...song, label: songs[cur()].label, index: cur(), type: 'song', color: songs[cur()].color, textColor: songs[cur()].textColor })
              setShowPanel(false)
              setStorage(songs)
            }}
            onClose={() => {
              setShowPanel(false)
            }}
            // eslint-disable-next-line solid/reactivity
            onFill={(name) => {
              setSongs(cur(), { name, label: songs[cur()].label, index: cur(), type: 'onlyname', color: songs[cur()].color, textColor: songs[cur()].textColor })
              setShowPanel(false)
              setStorage(songs)
            }}
            // eslint-disable-next-line solid/reactivity
            onClear={() => {
              setSongs(cur(), { label: songs[cur()].label, index: cur(), type: 'label', color: songs[cur()].color, textColor: songs[cur()].textColor })
              setShowPanel(false)
              setStorage(songs)
            }}
            onBackgroundColorChange={(color) => {
              setSongs(cur(), 'color', color)
              setStorage(songs)
            }}
            onTextColorChange={(color) => {
              setSongs(cur(), 'textColor', color)
              setStorage(songs)
            }}
            onLabelChange={(label) => {
              setSongs(cur(), 'label', label)
              setStorage(songs)
            }}
          />
        </Show>
        <div class="flex-1 scale-wrapper">
          <div
            ref={el => containerRef = el}
            class="scale-container"
            style={{ transform: `scale(${scale()})` }}
          >
            <div class="w-790px" classList={{ 'mx-a': ma() }}>
              <div ref={setDom} class="bg-white/100 p-8 pb-4" style="aspect-ratio:1/1;" >
                <input class="text-center font-700 text-2rem w-full border-none p-4" value="封面颜色推歌" />
                <GridShow
                  data={songs}
                  colors={GRID_COLORS}
                  onSelect={(id) => {
                    setCur(id)
                    setShowPanel(true)
                  }}
                />
                <Footer />
              </div>
              <button class="page mt-2 w-full" onClick={() => {
                const resetSongs = TYPES.map((i, j) => ({ label: i, type: 'label' as const, index: j }))
                setSongs(resetSongs)
                setStorage(resetSongs)
              }}>
                一键清除
              </button>
              <button class="page mt-2 w-full" disabled={!ma()} onClick={() => generateCanvas()}>
                {ma() ? '点击生成' : <>生成中 请稍等 网页突然靠左是<span class="line-through">特性</span></>}
              </button>
              <div class="text-center p-4">
                <a class="link" href="https://github.com/zengyichen/music-grid">GitHub</a>
              </div>
            </div>
            <Show when={showDownload()}>
              <Download data={img()} onClose={() => setDownload(false)} />
            </Show>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
