"use client";

import { Table } from "@tanstack/react-table";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	searchKey?: string;
	searchPlaceholder?: string;
	filterableColumns?: {
		id: string;
		title: string;
		options: { label: string; value: string }[];
	}[];
}

export function DataTableToolbar<TData>({
	table,
	searchKey,
	searchPlaceholder,
	filterableColumns = [],
}: DataTableToolbarProps<TData>) {
	const { t } = useTranslation();
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				{searchKey && (
					<Input
						placeholder={searchPlaceholder || t("superadmin.common.search")}
						value={
							(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
						}
						onChange={(event) =>
							table.getColumn(searchKey)?.setFilterValue(event.target.value)
						}
						className="h-8 max-w-[150px] lg:max-w-[250px]"
					/>
				)}
				{filterableColumns.map((column) => {
					const tableColumn = table.getColumn(column.id);
					if (!tableColumn) return null;

					return (
						<Select
							key={column.id}
							value={(tableColumn.getFilterValue() as string) ?? "all"}
							onValueChange={(value) =>
								tableColumn.setFilterValue(value === "all" ? undefined : value)
							}
						>
							<SelectTrigger className="h-8">
								<SelectValue placeholder={column.title} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{column.title}</SelectItem>
								{column.options.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					);
				})}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						{t("superadmin.common.reset")}
						<X className="ml-1 h-4 w-4" />
					</Button>
				)}
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm" className="ml-auto h-8">
						<SlidersHorizontal className="mr-2 h-4 w-4" />
						{t("superadmin.table.columns")}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{table
						.getAllColumns()
						.filter((column) => column.getCanHide())
						.map((column) => {
							return (
								<DropdownMenuCheckboxItem
									key={column.id}
									className="capitalize"
									checked={column.getIsVisible()}
									onCheckedChange={(value) => column.toggleVisibility(!!value)}
								>
									{column.id}
								</DropdownMenuCheckboxItem>
							);
						})}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
