interface PageProps {
  title: string
}

export default function Page(props: PageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-white to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <h2 className="font-bold text-3xl text-slate-900 dark:text-white">
        Welcome to My {props.title}
      </h2>
      <p className="text-slate-600 dark:text-slate-400">This is the homepage content.</p>
    </div>
  )
}
