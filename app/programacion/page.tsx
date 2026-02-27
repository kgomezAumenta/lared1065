import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Programación - La Red 106.1",
    description: "Conoce nuestra programación semanal en La Red 106.1",
};

interface Program {
    time: string;
    name: string;
    host?: string;
}

interface DaySchedule {
    day: string;
    programs: Program[];
}

// Placeholder schedule - this could be fetched from WordPress ACF or a CPT
const weeklySchedule: DaySchedule[] = [
    {

        day: "Lunes a Viernes",
        programs: [
            { time: "05:30 - 12:00", name: "LA PRIMERA DE LA RED", host: "Guillermo Velarde, Juan Francisco Romero, Fredy Cifuentes, Eduardo Escobar " },
            { time: "12:00 - 14:00", name: "LA SEGUNDA DE LA RED", host: "Iris Pérez y Alexis Ponce" },
            { time: "14:00 - 17:00", name: "GENTE DE FUTBOL", host: "Walter Avalos" },
            { time: "17:00 - 18:00", name: "LA TERCERA DE LA RED", host: "Keyla Castillo y Mynor Barrios" },
            { time: "18:00 - 20:00", name: "LA RED AL CIERRE", host: "Ivan Garcia y Mynor Barrios" },
            { time: "20:00 - 05:30", name: "LO MEJOR DE LA RED 106.1", host: "Equipo La Red" }
        ],
    },
    {
        day: "Sábado",
        programs: [
            { time: "06:00 - 22:00", name: "TRANSMISIONES DEPORTIVAS Y LAS VOCES DE LA RED", host: "Equipo La Red" },
        ],
    },
    {
        day: "Domingo",
        programs: [
            { time: "06:00 - 22:00", name: "TRANSMISIONES DEPORTIVAS Y LAS VOCES DE LA RED", host: "Equipo La Red" },
        ],
    },
];

export default function ProgramacionPage() {
    return (
        <main className="container mx-auto px-4 py-8 pb-32">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-extrabold uppercase text-gray-900">
                    Programación
                </h1>
            </div>

            {/* Schedule Grid */}
            <div className="space-y-8">
                {weeklySchedule.map((daySchedule, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        {/* Day Header */}
                        <div className="bg-red-600 text-white px-6 py-4">
                            <h2 className="text-2xl font-bold uppercase">{daySchedule.day}</h2>
                        </div>

                        {/* Programs List */}
                        <div className="divide-y divide-gray-200">
                            {daySchedule.programs.map((program, pIndex) => (
                                <div
                                    key={pIndex}
                                    className="px-6 py-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center gap-2 md:gap-6"
                                >
                                    {/* Time */}
                                    <div className="flex-shrink-0 md:w-40">
                                        <span className="text-red-600 font-bold text-lg">{program.time}</span>
                                    </div>

                                    {/* Program Info */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">{program.name}</h3>
                                        {program.host && (
                                            <p className="text-gray-500 text-sm">
                                                <span className="font-semibold">Conducido por:</span> {program.host}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Banner */}
            <div className="mt-12 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold mb-3">Escúchanos en Vivo</h3>
                <p className="text-lg mb-4">106.1 FM - Guatemala</p>
                <p className="text-sm opacity-90">
                    También puedes escucharnos en línea desde cualquier parte del mundo
                </p>
            </div>

            {/* Note */}
            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>* La programación está sujeta a cambios sin previo aviso</p>
            </div>
        </main>
    );
}
