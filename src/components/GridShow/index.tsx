import type { Component } from 'solid-js'
import { For } from 'solid-js'
import type { MayBeSong } from '../../utils/types'
import { SongShown } from '../SongShown'

const GridShow: Component<{
  data: MayBeSong[]
  colors: string[]
  onSelect: (id: number) => any
}> = (props) => {
  return (
    <div class="grid grid-cols-3 gap-4" style="aspect-ratio:1/1;">
      <For each={props.data}>
        {song => <SongShown song={song} onClick={props.onSelect} color={song.color ?? props.colors[song.index % props.colors.length]} />}
      </For>
    </div>
  )
}

export {
  GridShow,
}
