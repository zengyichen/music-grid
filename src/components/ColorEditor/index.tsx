import type { Component } from 'solid-js'

const ColorEditor: Component<{
  onBackgroundColorChange: (color: string) => void
  onTextColorChange: (color: string) => void
  defaultBackgroundColor?: string
  defaultTextColor?: string
}> = (props) => {
  return (
    <div class="space-y-2 my-2">
      <div class="flex items-center space-x-2">
        <label for="bg-color-picker" class="w-20">背景颜色:</label>
        <input
          id="bg-color-picker"
          type="color"
          value={props.defaultBackgroundColor || '#ffffff'}
          onInput={e => props.onBackgroundColorChange(e.currentTarget.value)}
        />
      </div>
      <div class="flex items-center space-x-2">
        <label for="text-color-picker" class="w-20">文字颜色:</label>
        <input
          id="text-color-picker"
          type="color"
          value={props.defaultTextColor || '#000000'}
          onInput={e => props.onTextColorChange(e.currentTarget.value)}
        />
      </div>
    </div>
  )
}

export { ColorEditor }
