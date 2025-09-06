export default function Button(props: { text: string; onClick: () => void }) {
  console.log('Remote1 Button!');
  return (
    <button onClick={props.onClick}>{props.text} --------- hello world </button>
  );
}
