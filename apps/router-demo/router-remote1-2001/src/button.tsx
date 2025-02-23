export default function Button(props: { text: string; onClick: () => void }) {
  console.log('Button Render');
  return <button onClick={props.onClick}>{props.text}</button>;
}
