"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Building2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Mock data for companies
const mockCompanies = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    price: 175.43,
    change: 2.34,
    changePercent: 1.35,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    price: 142.56,
    change: -1.23,
    changePercent: -0.86,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    price: 378.85,
    change: 5.67,
    changePercent: 1.52,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    price: 248.42,
    change: -3.45,
    changePercent: -1.37,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    sector: "E-commerce",
    price: 155.89,
    change: 0.78,
    changePercent: 0.5,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Technology",
    price: 875.28,
    change: 12.45,
    changePercent: 1.44,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    sector: "Technology",
    price: 485.32,
    change: -2.18,
    changePercent: -0.45,
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    sector: "Financial",
    price: 168.45,
    change: 1.23,
    changePercent: 0.73,
  },
];

interface Company {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Watchlist {
  id: string;
  name: string;
  description: string;
  companies: Company[];
}

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    {
      id: "1",
      name: "Tech Giants",
      description: "Large-cap technology companies with strong fundamentals",
      companies: [
        mockCompanies[0],
        mockCompanies[1],
        mockCompanies[2],
        mockCompanies[5],
        mockCompanies[6],
      ],
    },
    {
      id: "2",
      name: "Growth Stocks",
      description: "High-growth potential companies across various sectors",
      companies: [mockCompanies[3], mockCompanies[4], mockCompanies[5]],
    },
  ]);

  const [activeTab, setActiveTab] = useState("1");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(
    null
  );
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newWatchlistDescription, setNewWatchlistDescription] = useState("");
  const [searchOpen, setSearchOpen] = useState<string | null>(null);

  const createWatchlist = () => {
    if (!newWatchlistName.trim()) return;

    const newWatchlist: Watchlist = {
      id: Date.now().toString(),
      name: newWatchlistName,
      description: newWatchlistDescription,
      companies: [],
    };

    setWatchlists([...watchlists, newWatchlist]);
    setNewWatchlistName("");
    setNewWatchlistDescription("");
    setIsCreateDialogOpen(false);
    setActiveTab(newWatchlist.id);
  };

  const updateWatchlist = () => {
    if (!editingWatchlist || !newWatchlistName.trim()) return;

    setWatchlists(
      watchlists.map((w) =>
        w.id === editingWatchlist.id
          ? {
              ...w,
              name: newWatchlistName,
              description: newWatchlistDescription,
            }
          : w
      )
    );

    setIsEditDialogOpen(false);
    setEditingWatchlist(null);
    setNewWatchlistName("");
    setNewWatchlistDescription("");
  };

  const deleteWatchlist = (id: string) => {
    setWatchlists(watchlists.filter((w) => w.id !== id));
    if (activeTab === id && watchlists.length > 1) {
      setActiveTab(watchlists.find((w) => w.id !== id)?.id || "");
    }
  };

  const addCompanyToWatchlist = (watchlistId: string, company: Company) => {
    setWatchlists(
      watchlists.map((w) =>
        w.id === watchlistId
          ? {
              ...w,
              companies: w.companies.some((c) => c.symbol === company.symbol)
                ? w.companies
                : [...w.companies, company],
            }
          : w
      )
    );
    setSearchOpen(null);
  };

  const removeCompanyFromWatchlist = (watchlistId: string, symbol: string) => {
    setWatchlists(
      watchlists.map((w) =>
        w.id === watchlistId
          ? { ...w, companies: w.companies.filter((c) => c.symbol !== symbol) }
          : w
      )
    );
  };

  const openEditDialog = (watchlist: Watchlist) => {
    setEditingWatchlist(watchlist);
    setNewWatchlistName(watchlist.name);
    setNewWatchlistDescription(watchlist.description);
    setIsEditDialogOpen(true);
  };

  const availableCompanies = (watchlistId: string) => {
    const currentWatchlist = watchlists.find((w) => w.id === watchlistId);
    if (!currentWatchlist) return mockCompanies;

    return mockCompanies.filter(
      (company) =>
        !currentWatchlist.companies.some((c) => c.symbol === company.symbol)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Watchlists
          </h1>
          <p className="text-muted-foreground">
            Monitor and track your favorite companies
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Watchlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Watchlist</DialogTitle>
              <DialogDescription>
                Create a new watchlist to organize and monitor companies
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  placeholder="Enter watchlist name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newWatchlistDescription}
                  onChange={(e) => setNewWatchlistDescription(e.target.value)}
                  placeholder="Enter watchlist description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={createWatchlist}>Create Watchlist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {watchlists.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-950">
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No watchlists yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first watchlist to start monitoring companies
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Watchlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-950">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-slate-200 dark:border-slate-800">
              <TabsList className="h-11 bg-transparent justify-start flex overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal overflow-y-hidden no-scrollbar rounded-none border-b border-slate-200 dark:border-slate-800">
                {watchlists.map((watchlist) => (
                  <TabsTrigger
                    key={watchlist.id}
                    value={watchlist.id}
                    className="h-11 px-4 flex-shrink-0 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 data-[state=active]:bg-transparent relative text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    {watchlist.name}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {watchlist.companies.length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {watchlists.map((watchlist) => (
              <TabsContent
                key={watchlist.id}
                value={watchlist.id}
                className="space-y-4 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {watchlist.name}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(watchlist)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                    {watchlist.description && (
                      <p className="text-sm text-muted-foreground">
                        {watchlist.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover
                      open={searchOpen === watchlist.id}
                      onOpenChange={(open) =>
                        setSearchOpen(open ? watchlist.id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Search className="w-4 h-4 mr-2" />
                          Add Company
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="end">
                        <Command>
                          <CommandInput placeholder="Search companies..." />
                          <CommandList>
                            <CommandEmpty>No companies found.</CommandEmpty>
                            <CommandGroup>
                              {availableCompanies(watchlist.id).map(
                                (company) => (
                                  <CommandItem
                                    key={company.symbol}
                                    onSelect={() =>
                                      addCompanyToWatchlist(
                                        watchlist.id,
                                        company
                                      )
                                    }
                                    className="flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {company.symbol}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {company.name}
                                      </div>
                                    </div>
                                    <Badge variant="outline">
                                      {company.sector}
                                    </Badge>
                                  </CommandItem>
                                )
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWatchlist(watchlist.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {watchlist.companies.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No companies in this watchlist
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add companies to start monitoring
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                          <TableHead className="font-medium text-slate-900 dark:text-slate-100">
                            Symbol
                          </TableHead>
                          <TableHead className="font-medium text-slate-900 dark:text-slate-100">
                            Company
                          </TableHead>
                          <TableHead className="font-medium text-slate-900 dark:text-slate-100">
                            Sector
                          </TableHead>
                          <TableHead className="text-right font-medium text-slate-900 dark:text-slate-100">
                            Price
                          </TableHead>
                          <TableHead className="text-right font-medium text-slate-900 dark:text-slate-100">
                            Change
                          </TableHead>
                          <TableHead className="text-right font-medium text-slate-900 dark:text-slate-100">
                            Change %
                          </TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {watchlist.companies.map((company) => (
                          <TableRow
                            key={company.symbol}
                            className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                          >
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                              {company.symbol}
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                              {company.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {company.sector}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-slate-900 dark:text-slate-100">
                              ${company.price.toFixed(2)}
                            </TableCell>
                            <TableCell
                              className={`text-right font-mono ${
                                company.change >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              <div className="flex items-center justify-end gap-1">
                                {company.change >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {company.change >= 0 ? "+" : ""}
                                {company.change.toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell
                              className={`text-right font-mono ${
                                company.changePercent >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {company.changePercent >= 0 ? "+" : ""}
                              {company.changePercent.toFixed(2)}%
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeCompanyFromWatchlist(
                                    watchlist.id,
                                    company.symbol
                                  )
                                }
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Watchlist</DialogTitle>
            <DialogDescription>
              Update the name and description of your watchlist
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="Enter watchlist name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={newWatchlistDescription}
                onChange={(e) => setNewWatchlistDescription(e.target.value)}
                placeholder="Enter watchlist description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateWatchlist}>Update Watchlist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
