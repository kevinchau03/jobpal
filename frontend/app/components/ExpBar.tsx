"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ExpBar() {
			type UserType = {
				id: string;
				email: string;
				name?: string;
				role?: string;
				createdAt: string;
				exp?: number;
			};

  const { data: user } = useQuery<UserType>({
    queryKey: ["user", "me"],
    queryFn: () => api("/api/users/me"),
    staleTime: 1000 * 10,
  });		const exp = user?.exp ?? 0;
	const level = Math.floor(exp / 100) + 1;
	const progress = exp % 100;

	// compute title based on level
	const title = useMemo(() => {
		if (level <= 9) return "Noob";
		if (level <= 19) return "Crook";
		if (level <= 29) return "Cooking";
		if (level <= 39) return "Chicken jockey";
		// for 40-99, untitled increments
		if (level < 100) {
			const tensIndex = Math.floor(level / 10); // 4 => 40s
			const x = tensIndex - 3; // 4 -> 1
			return `untitled ${x}`;
		}
		return "Desperate";
	}, [level]);

	const pct = Math.round((progress / 100) * 100);

	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-2">
				<div>
					<h3 className="text-lg font-semibold">Level {level}</h3>
					<div className="text-sm text-gray-500">{title}</div>
				</div>
				<div className="text-sm text-gray-500">{progress}/100</div>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
				<div
					className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all"
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
}
