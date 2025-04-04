export default function Preview() {
  return (
    <div className="flex mt-16 mb-16  justify-center">
      <div className="flex justify-center w-[1000px]  bg-transparent">
        <img
          src="/preview.png"
          alt=""
          className=" rounded-xl max-w-full h-auto"
        />
      </div>
    </div>
  );
}
