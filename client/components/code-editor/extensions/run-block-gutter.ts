import { GutterMarker, gutter } from '@codemirror/view'

class RunBlockMarker extends GutterMarker {
  constructor(private onClick: () => void) {
    super()
  }

  override toDOM() {
    const marker = document.createElement('button')
    marker.className = 'cm-run-block-button group'
    marker.title = 'Run this block (Ctrl/Cmd + Enter)'
    marker.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" class="group-hover:fill-current"/>
      </svg>
    `
    marker.onclick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.onClick()
    }
    return marker
  }
}

export function createRunBlockGutter(onExecute: (query: string) => void) {
  return gutter({
    class: 'cm-run-block-gutter',
    lineMarker: (view, line) => {
      const doc = view.state.doc
      const currentLineNo = doc.lineAt(line.from).number
      let pos = 0
      let blockStart = -1
      let inBlock = false

      while (pos < doc.length) {
        const lineAt = doc.lineAt(pos)
        const text = lineAt.text.trim()

        if (text.length === 0) {
          pos = lineAt.to + 1
          continue
        }

        if (!inBlock) {
          blockStart = lineAt.number
          inBlock = true
        }

        if (text.includes(';')) {
          if (currentLineNo === blockStart) {
            const blockStartPos = doc.line(blockStart).from
            const blockEndPos = lineAt.to
            const blockText = doc.sliceString(blockStartPos, blockEndPos)
            return new RunBlockMarker(() => {
              onExecute(blockText.trim())
            })
          }
          inBlock = false
        }

        pos = lineAt.to + 1
      }
      return null
    },
  })
}
