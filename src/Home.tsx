import { VNode, h } from "preact";
import { Histogram, Normalized } from "./Histogram.js";

export function Home() {
  return (
    <div>
      <header class="py-10 bg-gray-800 ">
        <EnConstruccion />
        <Deuda />
      </header>

      <div class="mx-auto max-w-2xl px-4 pb-12 sm:px-6 lg:px-8">
        <div class="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <div class="px-4 py-6 sm:px-6">
            <h3 class="text-base font-semibold leading-7 text-gray-900">
              Crecimiento de la deuda
            </h3>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Descripcion del grafico
            </p>
          </div>

          <Histogram />
        </div>
      </div>
      <div class="mx-auto max-w-2xl px-4 pb-12 sm:px-6 lg:px-8">
        <div class="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <div class="px-4 py-6 sm:px-6">
            <h3 class="text-base font-semibold leading-7 text-gray-900">
              Asignacion presupuestaria
            </h3>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Descripcion del grafico
            </p>
          </div>

          <Normalized />
        </div>
      </div>
    </div>
  );
}

function EnConstruccion(): VNode {
  return (
    <div class="rounded-md bg-yellow-50 p-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">
            Sitio en construcción
          </h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>Los datos no son reales.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Deuda(): VNode {
  // poblacion 43.000.000
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
          US $ 8.620,30
        </div>
      </div>
      <div class="flex justify-between">
        <div class="text-3xl font-bold tracking-tight text-white">
          Producto bruto interno
        </div>
        <div class="text-3xl font-bold tracking-tight text-white">
          US $ 640.591.000.000,00
        </div>
      </div>
      <div class="flex justify-between">
        <div class="text-3xl font-bold tracking-tight text-white">
          Produccion por persona
        </div>
        <div class="text-3xl font-bold tracking-tight text-white">
          US $ 14.897,46
        </div>
      </div>
    </div>
  );
}
