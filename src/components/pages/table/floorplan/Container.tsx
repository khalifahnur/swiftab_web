"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableItem } from "@/types/table";
import FloorCanvas from "./FloorCanvas";
import { useQuery } from "@tanstack/react-query";
import { fetchRestaurantTables } from "@/hooks/tablehook/fetchrestable";
import { FullScreenLoader } from "@/components/Loading/FullScreen";
import { useSaveTable } from "@/hooks/tablehook/savelayouthook";
import { ChevronLeft, Undo2, Redo2, Plus, Minus, Trash2, RotateCw, Edit2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiningArea {
  id: string;
  name: string;
}

export default function Container() {
  const [diningAreas, setDiningAreas] = React.useState<DiningArea[]>([]);
  const [selectedFloor, setSelectedFloor] = React.useState<string>("");
  const [tables, setTables] = React.useState<TableItem[]>([]);
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null);
  
  // UI States
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; tableId: string | null } | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
  
  const { toast } = useToast();
  const saveTableMutation = useSaveTable();

  React.useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setIsLibraryOpen(false);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // --- Table Manipulation ---
  const handleUpdateTableTransform = (id: string, x: number, y: number, rotation: number) => {
    setTables((prev) => prev.map((t) => t.id === id ? { ...t, position: { x, y }, rotation } : t));
  };

  const handleRotateTable = (id: string) => {
    setTables((prev) => prev.map((t) => t.id === id ? { ...t, rotation: (t.rotation + 90) % 360 } : t));
    setContextMenu(null);
  };

  const handleRemoveTable = (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    setSelectedTableId(null);
    setContextMenu(null);
  };

  const handleAddChair = (tableId: string) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          const newChairId = `${table.id}-chair-${Date.now()}`;
          return { ...table, chairs: [...table.chairs, { id: newChairId, position: "top" as any }] };
        }
        return table;
      })
    );
    setContextMenu(null);
  };

  const handleRemoveChair = (tableId: string) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId && table.chairs.length > 0) {
          return { ...table, chairs: table.chairs.slice(0, -1) };
        }
        return table;
      })
    );
    setContextMenu(null);
  };

  const handleUpdateTableName = (tableId: string, newName: string) => {
    setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, name: newName } : t));
  };

  const handleAddTableFromLibrary = (shape: "rectangle" | "round" | "square", width: number, height: number, chairCount: number) => {
    const newTable: TableItem = {
      id: `T-${Date.now()}`,
      floorId: selectedFloor,
      name: `K-${tables.length + 1}`,
      status: "Free",
      position: { x: window.innerWidth / 3, y: window.innerHeight / 3 },
      rotation: 0,
      shape: shape,
      size: { width, height },
      chairs: Array.from({ length: chairCount }).map((_, i) => ({
        id: `chair-${Date.now()}-${i}`,
        position: "top" as any
      }))
    };
    setTables([...tables, newTable]);
    setSelectedTableId(newTable.id);
  };

  // --- Floor Management ---
  const handleAddFloor = () => {
    // In a production app, use a proper Dialog. Prompt is a quick native solution for the specific request.
    const name = prompt("Enter a name for the new floor/layout (e.g., Patio, 4th Floor):");
    if (name && name.trim() !== "") {
      const newFloorId = `floor-${Date.now()}`;
      setDiningAreas([...diningAreas, { id: newFloorId, name: name.trim() }]);
      setSelectedFloor(newFloorId);
      setSelectedTableId(null);
    }
  };

  // --- Data Fetching ---
  const { data, isLoading, error } = useQuery({
    queryKey: ["restaurantTables"],
    queryFn: fetchRestaurantTables,
    select: (data) => data?.restaurantLayoutData ? 
      { diningAreas: data.restaurantLayoutData.diningAreas, tablePosition: data.restaurantLayoutData.tablePosition } : 
      { diningAreas: [], tablePosition: [] },
  });

  React.useEffect(() => {
    if (data?.diningAreas) {
      const areasWithIds = data.diningAreas.map((area: string, index: number) => ({ id: (index + 1).toString(), name: area }));
      setDiningAreas(areasWithIds);
      if (!selectedFloor) setSelectedFloor(areasWithIds[0]?.id || "");
      if (tables.length === 0) setTables(data?.tablePosition || []);
    }
  }, [data]);

  const filteredTables = tables?.filter((t) => t.floorId === selectedFloor) || [];
  const selectedTableData = tables.find((t) => t.id === selectedTableId);

  const handleSave = () => {
    // Ensure dining areas are saved back in the format the Go backend expects
    if (tables.length >= 0) { // Allowed to save 0 tables
      saveTableMutation.mutate(tables, {
        onSuccess: () => toast({ title: "Layout saved successfully!" })
      });
    }
  };

  if (isLoading) return <FullScreenLoader desc="Loading floor plan..." />;
  if (error) return <div className="p-8 text-center text-red-500">Error loading floor plan.</div>;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-2rem)] min-h-[700px] bg-[#F8F9FA] font-sans border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
      
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 z-20 shrink-0">
        <div className="flex items-center gap-4 w-1/4">
          <button className="text-gray-400 hover:text-gray-900 transition-colors flex items-center text-sm font-medium">
            <ChevronLeft className="h-4 w-4 mr-1" /> Tables
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Arrange Tables</h1>
        </div>

        {/* Dynamic Floor Pills with "Add Layout" Button */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg w-auto max-w-[40%] overflow-x-auto scrollbar-hide shrink-0">
          {diningAreas.map((floor) => (
            <button
              key={floor.id}
              onClick={() => { setSelectedFloor(floor.id); setSelectedTableId(null); }}
              className={`px-6 py-1.5 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
                selectedFloor === floor.id ? "bg-[#1E1E1E] text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {floor.name}
            </button>
          ))}
          {/* Add Floor Button */}
          <button 
            onClick={handleAddFloor}
            title="Add new floor/layout"
            className="px-3 py-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-all ml-1 shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 w-1/3 relative">
          <Button variant="outline" size="icon" className="h-9 w-9 border-gray-200 text-gray-500"><Undo2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-9 w-9 border-gray-200 text-gray-500"><Redo2 className="h-4 w-4" /></Button>
          
          {/* Table Library Dropdown Trigger */}
          <div className="relative">
            <Button 
              variant="outline" 
              className="bg-white border-gray-200 text-gray-700 h-9 font-semibold"
              onClick={(e) => { e.stopPropagation(); setIsLibraryOpen(!isLibraryOpen); }}
            >
              Add Table <ChevronDown className="h-4 w-4 ml-2" />
            </Button>

            {/* Dropdown Library Content */}
            {isLibraryOpen && (
              <div 
                className="absolute top-12 right-0 w-80 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-gray-900">Table Library</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                  {/* Rectangle 4 Seats */}
                  <div onClick={() => { handleAddTableFromLibrary("rectangle", 140, 90, 4); setIsLibraryOpen(false); }} className="aspect-[4/3] bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 transition-all group">
                    <div className="w-12 h-8 bg-white shadow-sm border border-gray-200 rounded relative group-hover:scale-110 transition-transform mb-2">
                      <div className="absolute -top-1 left-2 w-2 h-1 bg-gray-200"></div><div className="absolute -top-1 right-2 w-2 h-1 bg-gray-200"></div>
                      <div className="absolute -bottom-1 left-2 w-2 h-1 bg-gray-200"></div><div className="absolute -bottom-1 right-2 w-2 h-1 bg-gray-200"></div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">4 Seats Rect</span>
                  </div>

                  {/* Square 2 Seats */}
                  <div onClick={() => { handleAddTableFromLibrary("square", 90, 90, 2); setIsLibraryOpen(false); }} className="aspect-[4/3] bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 transition-all group">
                    <div className="w-8 h-8 bg-white shadow-sm border border-gray-200 rounded relative group-hover:scale-110 transition-transform mb-2">
                      <div className="absolute top-2 -left-1 w-1 h-2 bg-gray-200"></div><div className="absolute top-2 -right-1 w-1 h-2 bg-gray-200"></div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">2 Seats Square</span>
                  </div>

                  {/* Round 4 Seats */}
                  <div onClick={() => { handleAddTableFromLibrary("round", 110, 110, 4); setIsLibraryOpen(false); }} className="aspect-[4/3] bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 transition-all group">
                    <div className="w-10 h-10 bg-white shadow-sm border border-gray-200 rounded-full relative group-hover:scale-110 transition-transform mb-2">
                      <div className="absolute -top-1 left-3.5 w-3 h-1 bg-gray-200"></div><div className="absolute -bottom-1 left-3.5 w-3 h-1 bg-gray-200"></div>
                      <div className="absolute top-3.5 -left-1 w-1 h-3 bg-gray-200"></div><div className="absolute top-3.5 -right-1 w-1 h-3 bg-gray-200"></div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">4 Seats Round</span>
                  </div>

                  {/* Rectangle 6 Seats */}
                  <div onClick={() => { handleAddTableFromLibrary("rectangle", 180, 90, 6); setIsLibraryOpen(false); }} className="aspect-[4/3] bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 transition-all group">
                    <div className="w-16 h-8 bg-white shadow-sm border border-gray-200 rounded relative group-hover:scale-110 transition-transform mb-2">
                      <div className="absolute -top-1 left-2 w-2 h-1 bg-gray-200"></div><div className="absolute -top-1 left-6 w-2 h-1 bg-gray-200"></div><div className="absolute -top-1 right-2 w-2 h-1 bg-gray-200"></div>
                      <div className="absolute -bottom-1 left-2 w-2 h-1 bg-gray-200"></div><div className="absolute -bottom-1 left-6 w-2 h-1 bg-gray-200"></div><div className="absolute -bottom-1 right-2 w-2 h-1 bg-gray-200"></div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">6 Seats Rect</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={saveTableMutation.isPending} className="bg-[#1E1E1E] hover:bg-black text-white px-6 h-9 rounded-md text-sm font-semibold ml-2 shadow-sm">
            {saveTableMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Canvas Area */}
        <div className="flex-1 relative bg-white">
          <div className="absolute inset-0 pointer-events-none opacity-[0.3]" style={{ backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
          <FloorCanvas 
            tables={filteredTables}
            selectedTableId={selectedTableId}
            onSelect={setSelectedTableId}
            onUpdateTransform={handleUpdateTableTransform}
            onContextMenu={(id, x, y) => setContextMenu({ x, y, tableId: id })}
          />
        </div>

        {/* Right Sidebar (Table Settings) - ONLY VISIBLE WHEN A TABLE IS SELECTED */}
        {selectedTableData && (
          <div className="w-[320px] shrink-0 bg-white border-l border-gray-200 shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right-8 duration-200">
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Table Settings</h2>
                <Button variant="outline" size="icon" onClick={() => handleRotateTable(selectedTableData.id)} className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:border-gray-900" title="Rotate 90°">
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Table Name</label>
                  <Input 
                    value={selectedTableData.name} 
                    onChange={(e) => handleUpdateTableName(selectedTableData.id, e.target.value)}
                    className="h-11 bg-gray-50 border-gray-200 focus-visible:ring-gray-900 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Seating Capacity ({selectedTableData.chairs.length})</label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleAddChair(selectedTableData.id)} className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold">
                      <Plus className="h-4 w-4 mr-2" /> Add 
                    </Button>
                    <Button variant="outline" onClick={() => handleRemoveChair(selectedTableData.id)} disabled={selectedTableData.chairs.length === 0} className="flex-1 border-gray-200 text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold">
                      <Minus className="h-4 w-4 mr-2" /> Remove 
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-gray-100 shrink-0">
                <Button variant="destructive" onClick={() => handleRemoveTable(selectedTableData.id)} className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-0 shadow-none h-11 font-bold tracking-wide">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Table
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Right-Click Context Menu */}
      {contextMenu && contextMenu.tableId && (
        <div 
          className="fixed bg-white border border-gray-200 shadow-2xl rounded-xl w-48 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()} 
        >
          <button onClick={() => { setSelectedTableId(contextMenu.tableId); setContextMenu(null); }} className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Edit2 className="h-4 w-4 mr-2.5 text-gray-400" /> Edit Settings
          </button>
          <button onClick={() => handleRotateTable(contextMenu.tableId!)} className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <RotateCw className="h-4 w-4 mr-2.5 text-gray-400" /> Rotate 90°
          </button>
          <button onClick={() => handleAddChair(contextMenu.tableId!)} className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Plus className="h-4 w-4 mr-2.5 text-gray-400" /> Add Chair
          </button>
          <div className="h-px bg-gray-100 my-1 mx-2" />
          <button onClick={() => handleRemoveTable(contextMenu.tableId!)} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2.5" /> Delete Table
          </button>
        </div>
      )}
    </div>
  );
}