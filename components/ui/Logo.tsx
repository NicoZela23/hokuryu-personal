import Link from 'next/link'

function Logo() {
  return (
    <Link href="/garden" className="font-serif text-lg font-semibold text-moss dark:text-moss-mid tracking-tight hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-moss rounded">
      HOKURYU
    </Link>
  )
}

export { Logo }
