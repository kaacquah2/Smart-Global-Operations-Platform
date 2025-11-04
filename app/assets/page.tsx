"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Download,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Wrench,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState } from "react"

export default function AssetsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState<string>('own')

  // Mock assets data
  const assets = [
    {
      id: '1',
      name: 'MacBook Pro 16"',
      assetTag: 'IT-LAP-001',
      serialNumber: 'SN123456789',
      category: 'Laptop',
      status: 'assigned',
      assignedTo: 'John Doe',
      location: 'New York Office',
      purchaseDate: '2023-01-15',
      purchaseCost: 2999.00,
      currentValue: 2499.00,
      warrantyExpiry: '2026-01-15',
      branch: 'HQ',
      department: 'IT'
    },
    {
      id: '2',
      name: 'Dell Monitor 27"',
      assetTag: 'IT-MON-002',
      serialNumber: 'SN987654321',
      category: 'Monitor',
      status: 'available',
      assignedTo: null,
      location: 'New York Office',
      purchaseDate: '2023-03-20',
      purchaseCost: 599.00,
      currentValue: 450.00,
      warrantyExpiry: '2026-03-20',
      branch: 'HQ',
      department: 'IT'
    },
    {
      id: '3',
      name: 'iPhone 14 Pro',
      assetTag: 'IT-PHN-003',
      serialNumber: 'SN456789123',
      category: 'Mobile Device',
      status: 'assigned',
      assignedTo: 'Jane Smith',
      location: 'London Office',
      purchaseDate: '2023-06-10',
      purchaseCost: 999.00,
      currentValue: 799.00,
      warrantyExpiry: '2025-06-10',
      branch: 'London',
      department: 'Sales'
    },
    {
      id: '4',
      name: 'Ergonomic Chair',
      assetTag: 'OF-FUR-004',
      serialNumber: 'SN789123456',
      category: 'Furniture',
      status: 'assigned',
      assignedTo: 'Mike Johnson',
      location: 'Tokyo Office',
      purchaseDate: '2023-02-05',
      purchaseCost: 399.00,
      currentValue: 350.00,
      warrantyExpiry: '2024-02-05',
      branch: 'Tokyo',
      department: 'Operations'
    },
    {
      id: '5',
      name: 'Projector Epson',
      assetTag: 'IT-PRJ-005',
      serialNumber: 'SN321654987',
      category: 'AV Equipment',
      status: 'maintenance',
      assignedTo: null,
      location: 'Conference Room A',
      purchaseDate: '2022-11-30',
      purchaseCost: 1299.00,
      currentValue: 899.00,
      warrantyExpiry: '2025-11-30',
      branch: 'HQ',
      department: 'IT'
    },
  ]

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || asset.status === filterStatus
    const matchesCategory = filterCategory === "all" || asset.category === filterCategory
    
    // Department filtering: non-admin users see only their department's assets by default
    let matchesDepartment = true
    if (user && !['admin', 'executive', 'ceo'].includes(user.role || '')) {
      if (filterDepartment === 'own') {
        matchesDepartment = asset.department === user.department
      } else if (filterDepartment !== 'all') {
        matchesDepartment = asset.department === filterDepartment
      }
      // filterDepartment === 'all' shows all assets (for department heads)
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDepartment
  })

  const stats = {
    total: assets.length,
    assigned: assets.filter(a => a.status === 'assigned').length,
    available: assets.filter(a => a.status === 'available').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    totalValue: assets.reduce((sum, a) => sum + a.currentValue, 0).toFixed(2),
    categories: Array.from(new Set(assets.map(a => a.category))).length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'retired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const categories = Array.from(new Set(assets.map(a => a.category)))

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-8 w-8 text-accent" />
                Asset Management
              </h1>
              <p className="text-muted-foreground">
                Track and manage company assets
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid gap-4 md:grid-cols-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Assets</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
                  </div>
                  <Wrench className="h-8 w-8 text-yellow-600" />
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
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{stats.categories}</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
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
                  <option value="assigned">Assigned</option>
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                  <option value="lost">Lost</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {user && !['admin', 'executive', 'ceo'].includes(user.role || '') && (
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                  >
                    <option value="own">My Department</option>
                    {user.role === 'department_head' && <option value="all">All Departments</option>}
                  </select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assets ({filteredAssets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Asset Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Asset Tag</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Assigned To</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Value</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="border-b border-border/50 hover:bg-accent/5">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.serialNumber}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="font-mono">
                            {asset.assetTag}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {asset.category}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {asset.assignedTo ? (
                            <span className="text-sm font-medium">{asset.assignedTo}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {asset.location}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">${asset.currentValue.toLocaleString()}</span>
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
                {filteredAssets.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No assets found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
