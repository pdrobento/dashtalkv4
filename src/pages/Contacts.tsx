import React, { useState } from "react";
import { ZattenSidebar } from "@/components/ZattenSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  Search,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  ChevronRight,
  Menu,
} from "lucide-react";

// Mock data for contacts
const contactsMock = [
  {
    id: 1,
    name: "Adriano Fante",
    phone: "5563928787821",
    kanban: "lead contactado",
    tags: [],
    lastInteraction: "23/05/2025 20:12",
  },
  {
    id: 2,
    name: "Márcio André Macedo",
    phone: "5516988497777",
    kanban: "lead contactado",
    tags: [],
    lastInteraction: "23/05/2025 20:07",
  },
  {
    id: 3,
    name: "Jordão",
    phone: "5516991408202",
    kanban: "Operador",
    tags: [],
    lastInteraction: "06/05/2025 10:29",
  },
  {
    id: 4,
    name: "Marcel Soares",
    phone: "5516996447782",
    kanban: "lead contactado",
    tags: [],
    lastInteraction: "05/05/2025 13:54",
  },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState(contactsMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKanban, setFilterKanban] = useState("all");

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    const matchesKanban =
      filterKanban === "all" || contact.kanban === filterKanban;
    return matchesSearch && matchesKanban;
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-zatten-bg-primary">
        <main className="flex-1 flex flex-col min-w-0 ">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-3 p-4 border-b border-zatten-border-tertiary bg-zatten-bg-primary">
            <SidebarTrigger className="text-zatten-text-muted hover:text-zatten-text-primary" />
            <h1 className="text-lg font-semibold text-zatten-text-primary truncate">
              Contatos
            </h1>
          </div>

          <div className="flex-1 overflow-auto px-2 md:px-8 py-4 md:py-8">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="text-zatten-text-muted hover:text-zatten-text-primary"
              >
                <ChevronLeft size={20} />
              </Button>
              <h1 className="text-xl font-semibold text-zatten-text-primary">
                Contatos do Emin - Marcel
              </h1>
              <div className="ml-auto">
                <Select defaultValue="emin-marcel">
                  <SelectTrigger className="w-[200px] zatten-card text-zatten-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="zatten-card">
                    <SelectItem
                      value="emin-marcel"
                      className="text-zatten-text-primary"
                    >
                      Emin - Marcel
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile Header for when sidebar is hidden */}
            <div className="md:hidden mb-4">
              <div className="mb-4">
                <Select defaultValue="emin-marcel">
                  <SelectTrigger className="w-full zatten-card text-zatten-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="zatten-card">
                    <SelectItem
                      value="emin-marcel"
                      className="text-zatten-text-primary"
                    >
                      Emin - Marcel
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={filterKanban} onValueChange={setFilterKanban}>
                <SelectTrigger className="w-full sm:w-[200px] zatten-card text-zatten-text-primary">
                  <SelectValue placeholder="Todos os contatos" />
                </SelectTrigger>
                <SelectContent className="zatten-card">
                  <SelectItem value="all" className="text-zatten-text-primary">
                    Todos os contatos
                  </SelectItem>
                  <SelectItem
                    value="lead contactado"
                    className="text-zatten-text-primary"
                  >
                    Lead contactado
                  </SelectItem>
                  <SelectItem
                    value="Operador"
                    className="text-zatten-text-primary"
                  >
                    Operador
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zatten-text-muted"
                  size={18}
                />
                <Input
                  placeholder="Pesquisar por nome ou telefone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 zatten-input"
                />
              </div>
            </div>

            {/* Table Container with Horizontal Scroll on Mobile */}
            <div className="zatten-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-b border-zatten-border-secondary hover:bg-transparent">
                      <TableHead className="text-zatten-text-secondary font-medium min-w-[120px]">
                        Nome
                      </TableHead>
                      <TableHead className="text-zatten-text-secondary font-medium min-w-[130px]">
                        Telefone
                      </TableHead>
                      <TableHead className="text-zatten-text-secondary font-medium min-w-[120px]">
                        Kanban
                      </TableHead>
                      <TableHead className="text-zatten-text-secondary font-medium min-w-[80px] hidden sm:table-cell">
                        Tags
                      </TableHead>
                      <TableHead className="text-zatten-text-secondary font-medium min-w-[140px] hidden md:table-cell">
                        Última Interação
                      </TableHead>
                      <TableHead className="text-zatten-text-secondary font-medium min-w-[80px]">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow
                        key={contact.id}
                        className="border-b border-zatten-border-secondary hover:bg-zatten-bg-hover transition-colors"
                      >
                        <TableCell className="text-zatten-text-primary font-medium">
                          <div className="min-w-0">
                            <div className="truncate">{contact.name}</div>
                            {/* Show interaction date on mobile below name */}
                            <div className="text-xs text-zatten-text-muted md:hidden mt-1">
                              {contact.lastInteraction}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zatten-text-secondary">
                          <div className="truncate">{contact.phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              contact.kanban === "Operador"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              contact.kanban === "Operador"
                                ? "bg-zatten-accent text-white hover:bg-zatten-accent-hover text-xs"
                                : "bg-zatten-bg-hover text-zatten-text-primary hover:bg-zatten-bg-hover text-xs"
                            }
                          >
                            <span className="truncate">{contact.kanban}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zatten-text-secondary hidden sm:table-cell">
                          {contact.tags.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {contact.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-zatten-text-secondary hidden md:table-cell">
                          {contact.lastInteraction}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zatten-text-muted hover:text-zatten-text-primary"
                            >
                              <ExternalLink size={14} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zatten-text-muted hover:text-zatten-text-primary"
                                >
                                  <MoreHorizontal size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="zatten-card">
                                <DropdownMenuItem className="text-zatten-text-primary hover:bg-zatten-bg-hover">
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zatten-error hover:bg-zatten-bg-hover">
                                  <Trash2 size={16} className="mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Footer with pagination info - Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 text-sm text-zatten-text-muted">
              <span className="text-center sm:text-left">
                Mostrando 1 a 4 de 4 contatos
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zatten-text-muted hover:text-zatten-text-primary text-xs sm:text-sm"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">Ant</span>
                </Button>
                <span className="px-2 py-1 zatten-card text-zatten-text-primary text-xs sm:text-sm">
                  1
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zatten-text-muted hover:text-zatten-text-primary text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <span className="sm:hidden">Prox</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
