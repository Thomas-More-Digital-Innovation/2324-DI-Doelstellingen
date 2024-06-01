function makeAccordion(...props) {
  let string = ``;
  for (const k in props) {
    string += `
      <div class='accordion-item w-full ${k == 0 && 'rounded-t-xl'}'>
        <div class='header cursor-pointer flex justify-between items-center p-5 font-medium text-gray-500 border ${k != props.length-1 && "border-b-0"} border-gray-200 ${k == 0 && 'rounded-t-xl'} hover:bg-blue-100'>
          <p>${props[k].title}</p>
          <svg xmlns='http://www.w3.org/2000/svg' class='circle border border-gray-500 rounded-full p-1 flex-none' width='30' height='30' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'>
            <path class='line' d='M12 5l0 14'></path>
            <path d='M5 12l14 0'></path>
          </svg>
        </div>
        <div class='hidden toggle border border-gray-200'>
          <div class='p-5 text-black'>
            ${props[k].text}
          </div>
        </div>
      </div>
    `;
  }
  return `<div class='w-full mb-5'>${string}</div>`;
}