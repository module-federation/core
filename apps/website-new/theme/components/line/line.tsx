export interface LineProps {
  showStart?: boolean;
  showEnd?: boolean;
  class?: string;
}

export default (props: LineProps) => {
  return (
    <div className={`flex items-center ${props.class || ''}`}>
      {props.showStart !== false && (
        <div className="w-[3px] h-[3px] rounded-full bg-blue-gray-400"></div>
      )}
      <div className="flex-1 w-full h-[1px] bg-blue-gray-400"></div>
      {props.showEnd !== false && (
        <div className="w-[3px] h-[3px] rounded-full bg-blue-gray-400"></div>
      )}
    </div>
  );
};
