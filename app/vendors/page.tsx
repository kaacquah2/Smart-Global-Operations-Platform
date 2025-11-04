"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Building2, 
  Plus, 
  Search, 
  Download,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Globe
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllDepartments } from "@/lib/supabase/queries"
import { Filter } from "lucide-react"

export default function VendorsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState<string>('own')
  const [departments, setDepartments] = useState<any[]>([])

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await getAllDepartments()
        setDepartments(depts || [])
      } catch (error) {
        console.error('Error loading departments:', error)
      }
    }
    loadDepartments()
  }, [])

  const vendors = [
    {
      id: '1',
      name: 'Tech Solutions Inc.',
      category: 'IT Services',
      status: 'active',
      contactPerson: 'John Smith',
      email: 'john@techsolutions.com',
      phone: '+1-555-0101',
      website: 'www.techsolutions.com',
      contracts: 3,
      totalValue: 125000,
      lastContractDate: '2024-01-15',
      nextRenewal: '2025-01-15',
      rating: 4.5,
      country: 'USA',
      departments: ['IT & Technology', 'Operations']
    },
    {
      id: '2',
      name: 'Office Supplies Co.',
      category: 'Office Supplies',
      status: 'active',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@officesupplies.com',
      phone: '+1-555-0102',
      website: 'www.officesupplies.com',
      contracts: 5,
      totalValue: 45000,
      lastContractDate: '2024-02-20',
      nextRenewal: '2025-02-20',
      rating: 4.8,
      country: 'USA',
      departments: ['HR & Admin', 'Finance & Accounting', 'Operations']
    },
    {
      id: '3',
      name: 'Global Shipping Ltd.',
      category: 'Logistics',
      status: 'active',
      contactPerson: 'Mike Chen',
      email: 'mike@globalshipping.com',
      phone: '+44-20-1234-5678',
      website: 'www.globalshipping.com',
      contracts: 2,
      totalValue: 89000,
      lastContractDate: '2023-12-10',
      nextRenewal: '2024-12-10',
      rating: 4.2,
      country: 'UK',
      departments: ['Procurement & Supply-Chain', 'Operations', 'Sales & Marketing']
    },
  ]

  const contracts = [
    {
      id: '1',
      vendorId: '1',
      vendorName: 'Tech Solutions Inc.',
      title: 'Software License Agreement',
      type: 'Software License',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      value: 50000,
      status: 'active',
      renewalDate: '2025-01-15',
      autoRenew: true,
      terms: 'Annual subscription'
    },
    {
      id: '2',
      vendorId: '2',
      vendorName: 'Office Supplies Co.',
      title: 'Office Supplies Contract',
      type: 'Procurement',
      startDate: '2024-02-20',
      endDate: '2025-02-20',
      value: 45000,
      status: 'active',
      renewalDate: '2025-02-20',
      autoRenew: true,
      terms: 'Monthly delivery'
    },
    {
      id: '3',
      vendorId: '3',
      vendorName: 'Global Shipping Ltd.',
      title: 'Shipping Services Agreement',
      type: 'Services',
      startDate: '2023-12-10',
      endDate: '2024-12-10',
      value: 89000,
      status: 'expiring_soon',
      renewalDate: '2024-12-10',
      autoRenew: false,
      terms: 'Per shipment basis'
    },
  ]

  const stats = {
    totalVendors: vendors.length,
    activeVendors: vendors.filter(v => v.status === 'active').length,
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    expiringSoon: contracts.filter(c => c.status === 'expiring_soon').length,
    totalValue: contracts.reduce((sum, c) => sum + c.value, 0).toLocaleString(),
  }

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || v.status === filterStatus
    
    // Department filtering: non-admin users see only vendors used by their department
    let matchesDepartment = true
    if (user && !['admin', 'executive', 'ceo'].includes(user.role || '')) {
      if (filterDepartment === 'own') {
        matchesDepartment = v.departments?.includes(user.department || '') || false
      } else if (filterDepartment !== 'all') {
        matchesDepartment = v.departments?.includes(filterDepartment) || false
      }
      // filterDepartment === 'all' shows all vendors (for department heads)
    }
    
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'terminated': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-8 w-8 text-accent" />
                Vendor & Contract Management
              </h1>
              <p className="text-muted-foreground">
                Manage vendors and track contracts
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Vendor
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vendors</p>
                    <p className="text-2xl font-bold">{stats.totalVendors}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Vendors</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeVendors}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contracts</p>
                    <p className="text-2xl font-bold">{stats.totalContracts}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-emerald-600">${stats.totalValue}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {user && !['admin', 'executive', 'ceo'].includes(user.role || '') && (
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own">My Department</SelectItem>
                      {(user.role === 'department_head' || user.role === 'manager') && (
                        <SelectItem value="all">All Departments</SelectItem>
                      )}
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs: Vendors and Contracts */}
          <div className="mb-6 flex gap-2 border-b border-border">
            <Button variant="ghost" className="rounded-b-none border-b-2 border-accent">
              Vendors
            </Button>
            <Button variant="ghost" className="rounded-b-none">
              Contracts
            </Button>
          </div>

          {/* Vendors Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vendors ({filteredVendors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Vendor</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Contracts</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Total Value</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Rating</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Next Renewal</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b border-border/50 hover:bg-accent/5">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{vendor.status}</Badge>
                              <span className="text-xs text-muted-foreground">{vendor.country}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">{vendor.category}</td>
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{vendor.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{vendor.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">{vendor.contracts}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">${vendor.totalValue.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">{vendor.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(vendor.nextRenewal), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm" className="gap-2">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Contracts ({contracts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Contract</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Vendor</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Value</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Start Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">End Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="border-b border-border/50 hover:bg-accent/5">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{contract.title}</p>
                            <p className="text-xs text-muted-foreground">{contract.terms}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">{contract.vendorName}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{contract.type}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">${contract.value.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {format(new Date(contract.startDate), 'MMM d, yyyy')}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {format(new Date(contract.endDate), 'MMM d, yyyy')}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <FileText className="h-4 w-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
