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
    // Reset to current item values every time the form opens
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
        className="text-xs text-ink-muted dark:text-ink-muted hover:text-moss dark:hover:text-moss-mid transition-colors focus:outline-none focus:ring-2 focus:ring-moss rounded"
      >
        edit details
      </button>
    )
  }

  return (
    <div className="p-4 rounded-lg border border-ink-faint dark:border-moss-ink/30 bg-paper-dark dark:bg-forest-card space-y-3">
      <p className="text-xs font-medium text-ink-muted dark:text-ink-muted uppercase tracking-wider">
        edit details
      </p>

      <div className="space-y-2">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title"
          className="w-full text-sm bg-transparent border-b border-ink-faint dark:border-moss-ink/30 text-ink dark:text-paper placeholder:text-ink-muted pb-1 focus:outline-none focus:border-moss"
        />

        {/* Author + Type */}
        <div className="grid grid-cols-2 gap-2">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="author / creator"
            className="text-xs px-2 py-1.5 bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss"
          />
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
            className="text-xs px-2 py-1.5 bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-moss"
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* URL */}
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="url (optional)"
          className="w-full text-xs px-2 py-1.5 bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss font-mono"
        />

        {/* Genre + Recommender */}
        <div className="grid grid-cols-2 gap-2">
          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="genre"
            className="text-xs px-2 py-1.5 bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss"
          />
          <input
            value={recommender}
            onChange={(e) => setRecommender(e.target.value)}
            placeholder="recommended by"
            className="text-xs px-2 py-1.5 bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!title.trim() || updateItem.isPending}
          className="text-sm px-4 py-1.5 bg-moss text-white rounded hover:bg-moss-dark transition-colors focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-50"
        >
          {updateItem.isPending ? 'saving...' : 'save'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-ink-muted dark:text-ink-muted hover:text-ink dark:hover:text-paper transition-colors focus:outline-none focus:ring-2 focus:ring-moss rounded"
        >
          cancel
        </button>
      </div>
    </div>
  )
}

export { ItemEditForm }
