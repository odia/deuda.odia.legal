import { VNode, h } from "preact";
import { Histogram } from "./Histogram.js";

export function Home() {
  return (
    <div>
      <header class="py-10 bg-gray-800 ">
        <Deuda />
      </header>
      <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div class="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <Histogram />
        </div>
      </div>
    </div>
  );
}

function Deuda(): VNode {
  return (
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between">
        <div class="text-3xl font-bold tracking-tight text-white">
          Deuda Nacional
        </div>
        <div class="text-3xl font-bold tracking-tight text-white">
          US $ 370.673.000.000,00
        </div>
      </div>
      <div class="flex justify-between">
        <div class="text-3xl font-bold tracking-tight text-white">
          Deuda por persona
        </div>
        <div class="text-3xl font-bold tracking-tight text-white">
          US $ 8.695,65
        </div>
      </div>
      <div class="flex justify-between">
        <div class="text-3xl font-bold tracking-tight text-white">
          Producto bruto interno
        </div>
        <div class="text-3xl font-bold tracking-tight text-white">
          US $ 631.000.000.000,00
        </div>
      </div>
    </div>
  );
}
