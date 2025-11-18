import type { Component } from 'solid-js'
import { Show, createResource, createSignal } from 'solid-js'
import { onClickOutside } from 'solidjs-use'
import { searchSong } from '../../utils/request'
import type { SongType } from '../../utils/types'
import { ColorEditor } from '../ColorEditor'
import { Pagination } from '../Pagination'
import { SuspenseGrid } from '../SuspenseGrid'

type FormSubmitEvent = Event & {
  submitter: HTMLElement
} & {
  currentTarget: HTMLFormElement
  target: Element
}

interface SearchState {
  keyword: string
  page: number
}

const SearchPanel: Component<{
  onSelect: (song: SongType) => any
  onClose?: () => any
  onFill: (name: string) => any
  onClear: () => any
  onBackgroundColorChange: (color: string) => void
  onTextColorChange: (color: string) => void
  onLabelChange: (label: string) => void
  initialBackgroundColor?: string
  initialTextColor?: string
  initialLabel?: string
}> = (props) => {
  const [state, setState] = createSignal<SearchState>({ keyword: '', page: 0 }, {
    equals: (prev, next) => prev.keyword.trim() === next.keyword.trim() && prev.page === next.page,
  })
  const [data] = createResource(state, searchSong)
  const [el, setEl] = createSignal<HTMLInputElement>()
  const [labelEl, setLabelEl] = createSignal<HTMLInputElement>()
  function onInputEnter(e: FormSubmitEvent) {
    e.preventDefault()
    setState({
      keyword: el().value,
      page: 0,
    })
  }
  function onPageChange(v: number) {
    const newPage = state().page + v
    if (newPage < 0 || newPage > 100 || state().keyword.trim() === '')
      return
    setState(p => ({ keyword: p.keyword, page: newPage }))
  }

  return (
    <div class="w-300px p-4 bg-gray-100 h-full overflow-y-auto">
      <div class="mb-4">
        <label for="label-input" class="block mb-2 font-semibold">格子标题:</label>
        <input
          id="label-input"
          ref={setLabelEl}
          type="text"
          class="cus-input"
          value={props.initialLabel || ''}
          onInput={e => props.onLabelChange(e.currentTarget.value)}
          placeholder="输入标题"
        />
      </div>
      <ColorEditor 
        onBackgroundColorChange={props.onBackgroundColorChange} 
        onTextColorChange={props.onTextColorChange}
        defaultBackgroundColor={props.initialBackgroundColor}
        defaultTextColor={props.initialTextColor}
      />
      <form onSubmit={onInputEnter} action="">
        <input
          ref={setEl}
          type="search"
          autofocus={true}
          class="cus-input"
          placeholder='输入关键词 查询歌曲'
        />
      </form>
      <Show when={state().keyword.trim() !== ''}>
        <SuspenseGrid data={data} onSelect={props.onSelect} />
      </Show>
      <Pagination
        data={data}
        state={state}
        onChange={onPageChange}
        onClose={props.onClose}
      />
      <div class="text-center space-x-2">
        <button
          class="page"
          onClick={() => props.onFill(el().value)}
          disabled={state().keyword.trim() === ''}
        >没有找到想要的？直接填入吧
        </button>
        <button class="page" onClick={() => props.onClear()}>清除这个格子</button>
      </div>
    </div>
  )
}

export {
  SearchPanel,
}

export type {
  SearchState,
}
