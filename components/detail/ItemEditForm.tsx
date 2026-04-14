'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUpdateItem } from '@/lib/query/hooks/useItems'
import { SOURCE_TYPES } from '@/lib/utils/types'
import type { Item, SourceType } from '@/lib/utils/types'

type Props = { item: Item }

function ItemEditForm({ item }: Props) {
  const [open, setOpen]               = useState(false)
  const router                        = useRouter()
  const updateItem                    = useUpdateItem()

  const [title, setTitle]             = useState(item.title)
  const [author, setAuthor]           = useState(item.author ?? '')
  const [url, setUrl]                 = useState(item.url ?? '')
  const [sourceType, setSourceType]   = useState<SourceType>(item.sourceType as SourceType)
  const [genre, setGenre]             = useState(item.genre ?? '')
  const [recommender, setRecommender] = useState(item.recommender ?? '')

  function handleOpen() {
    setTitle(item.title)
    setAuthor(item.author ?? '')
    setUrl(item.url ?? '')
    setSourceType(item.sourceType as SourceType)
    setGenre(item.genre ?? '')
    setRecommender(item.recommender ?? '')
    setOpen(true)
  }

  async function handleSave() {
    if (!title.trim()) return
    await updateItem.mutateAsync({
      id:    item.id,
      patch: {
        title:       title.trim(),
        author:      author.trim()      || null,
        url:         url.trim()         || null,
        sourceType,
        genre:       genre.trim()       || null,
        recommender: recommender.trim() || null,
      },
    })
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="font-display text-base tracking-widest text-phosphor-dim hover:text-phosphor transition-colors focus:outline-none"
      >
        &gt; EDIT RECORD DATA
      </button>
    )
  }

  const inputClass = 'w-full bg-vault font-mono text-sm text-phosphor border border-vault-border px-3 py-2 focus:outline-none focus:border-phosphor placeholder:text-phosphor-dim transition-colors'
  const labelClass = 'font-display text-base text-phosphor-dim tracking-widest'

  return (
    <div className="border border-vault-border bg-vault-panel p-4 space-y-4">
      <p className="font-display text-lg text-phosphor-dim tracking-widest border-b border-vault-border pb-2">
        ■ EDIT RECORD
      </p>

      <div className="space-y-3">
        <div>
          <label className={labelClass}>TITLE</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="record title"
            className={`${inputClass} mt-1`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>AUTHOR</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="author / creator"
              className={`${inputClass} mt-1`}
            />
          </div>
          <div>
            <label className={labelClass}>TYPE</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              className={`${inputClass} mt-1`}
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className={`${inputClass} mt-1`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>GENRE</label>
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="genre"
              className={`${inputClass} mt-1`}
            />
          </div>
          <div>
            <label className={labelClass}>SOURCE</label>
            <input
              value={recommender}
              onChange={(e) => setRecommender(e.target.value)}
              placeholder="recommended by"
              className={`${inputClass} mt-1`}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-vault-border/50">
        <button
          onClick={handleSave}
          disabled={!title.trim() || updateItem.isPending}
          className="font-display text-lg tracking-widest border border-phosphor text-phosphor px-4 py-1 hover:bg-vault-active transition-colors focus:outline-none disabled:opacity-50"
        >
          {updateItem.isPending ? '◌ SAVING...' : '▸ SAVE'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="font-display text-lg tracking-widest text-phosphor-dim hover:text-phosphor transition-colors focus:outline-none"
        >
          CANCEL
        </button>
      </div>
    </div>
  )
}

export { ItemEditForm }
