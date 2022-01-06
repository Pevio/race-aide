
interface Props {
  children: React.ReactElement;
}

export function HomePageWrapper(props: Props) {

  return (
    <HomePageWrapper>
      {props.children}
    </HomePageWrapper>
  )
}