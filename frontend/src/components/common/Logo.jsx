export default function Logo({ className = 'h-9 w-auto sm:h-10' }) {
  return (
    <>
      <img
        src="/logoLight.png"
        alt="Vidyank"
        className={`${className} dark:hidden`}
      />
      <img
        src="/logoDark.png"
        alt="Vidyank"
        className={`${className} hidden dark:block`}
      />
    </>
  )
}
