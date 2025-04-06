interface LoadingProps {
  size?: number;
}

export default function Loader({ size = 24 }: LoadingProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        style={{
          width: size,
          height: size,
        }}
        className={`border-2 border-white border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
}
