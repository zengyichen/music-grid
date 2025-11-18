import type { Component } from 'solid-js'
import { Match, Switch } from 'solid-js'
import type { MayBeSong, OnlyName, SongShownType } from '../../utils/types'
import { SongView } from '../SongView'

const SongShown: Component<{
  song: MayBeSong
  onClick: (id: number) => any
  color?: string
}> = (props) => {
  // Use custom color from song if set, otherwise use default color
  const appliedBgColor = () => props.song.color ?? props.color ?? ''
  const appliedTextColor = () => props.song.textColor ?? ''
  
  // Check if color is hex code (custom) or class name (default)
  const isBgHexColor = () => appliedBgColor().startsWith('#')
  const isTextHexColor = () => appliedTextColor().startsWith('#')
  
  const titleClass = (() => {
    // If custom text color is set, don't use class
    if (isTextHexColor()) return ''
    
    const c = appliedBgColor()
    // If this is the "黑色" tile, force white title per requirement
    if (props.song.label === '黑色' || c.includes('slate') || c.includes('black'))
      return 'text-white'
    if (c.includes('blue')) return 'text-blue-800'
    if (c.includes('yellow')) return 'text-yellow-800'
    if (c.includes('red')) return 'text-red-800'
    if (c.includes('gray')) return 'text-gray-800'
    if (c.includes('orange')) return 'text-orange-800'
    if (c.includes('pink')) return 'text-pink-800'
    if (c.includes('purple')) return 'text-purple-800'
    if (c.includes('green')) return 'text-green-800'
    // fallback - for hex colors, use black text
    return 'text-gray-800'
  })()

  const titleStyle = () => {
    if (isTextHexColor()) {
      return { color: appliedTextColor() }
    }
    return {}
  }

  return (
    <div 
      class={`cursor-pointer shadow p-2 ${isBgHexColor() ? '' : appliedBgColor()}`} 
      style={isBgHexColor() ? { 'background-color': appliedBgColor() } : {}}
      onClick={() => props.onClick(props.song.index)}
    >
      <strong class={`${titleClass} text-xl mb-2`} style={titleStyle()}>{props.song.label}</strong>
      <Switch>
        <Match when={props.song.type === 'label'}>
          <div class="w-200px h-200px" />
        </Match>
        <Match when={props.song.type === 'song'}>
          <SongView song={props.song as SongShownType} />
        </Match>
        <Match when={props.song.type === 'onlyname'}>
          <div class="w-200px h-200px flex justify-center items-center">
            {(props.song as OnlyName).name}
          </div>
        </Match>
      </Switch>
    </div>
  )
}

export {
  SongShown,
}
