import Image from 'next/image'

type Props = {
  avatarUrl: string | null
  username:  string
  size?:     number
  className?: string
}

function Avatar({ avatarUrl, username, size = 48, className = '' }: Props) {
  const initials = username.slice(0, 2).toUpperCase()

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`${username} avatar`}
        width={size}
        height={size}
        unoptimized
        className={`object-cover border border-vault-border ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center bg-vault-active border border-vault-border font-display text-phosphor-bright ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={`${username} avatar`}
    >
      {initials}
    </div>
  )
}

export { Avatar }
