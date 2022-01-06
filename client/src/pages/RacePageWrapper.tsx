
interface Props {
  children: React.ReactElement;
}

export function RacePageWrapper(props: Props) {

  return (
    <div>
      {props.children}
    </div>
  )
}