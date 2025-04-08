export default function Button(props: { text: string; onClick: () => void }) {
  return <button onClick={props.onClick}>{props.text}</button>;
}
