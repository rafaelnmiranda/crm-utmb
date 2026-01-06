'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { DealCounterpart, SponsorshipTier, SponsorshipCounterpart } from '@/types'

interface DealCounterpartsManagerProps {
  dealId: string
}

export default function DealCounterpartsManager({ dealId }: DealCounterpartsManagerProps) {
  const [counterparts, setCounterparts] = useState<DealCounterpart[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [tiers, setTiers] = useState<SponsorshipTier[]>([])
  const [availableCounterparts, setAvailableCounterparts] = useState<SponsorshipCounterpart[]>([])
  const [selectedTierId, setSelectedTierId] = useState<string>('')
  const [selectedCounterpartId, setSelectedCounterpartId] = useState<string>('')
  const [importing, setImporting] = useState(false)
  const [newCounterpart, setNewCounterpart] = useState({ counterpart_id: '', name: '', details: '', included: true })
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)

  const fetchTiers = useCallback(async () => {
    try {
      const response = await fetch('/api/sponsorship-tiers')
      if (!response.ok) throw new Error('Erro ao carregar cotas')
      const data = await response.json()
      setTiers(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  const fetchAvailableCounterparts = useCallback(async () => {
    try {
      const response = await fetch('/api/sponsorship-counterparts')
      if (!response.ok) throw new Error('Erro ao carregar entregáveis disponíveis')
      const data = await response.json()
      setAvailableCounterparts(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  const fetchCounterparts = useCallback(async () => {
    try {
      const response = await fetch(`/api/deals/${dealId}/counterparts`)
      if (!response.ok) throw new Error('Erro ao carregar entregáveis')
      const data = await response.json()
      setCounterparts(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchCounterparts()
    fetchTiers()
    fetchAvailableCounterparts()
  }, [dealId, fetchCounterparts, fetchTiers, fetchAvailableCounterparts])

  const handleSaveCounterpart = async (counterpart: DealCounterpart) => {
    try {
      const response = await fetch(
        `/api/deals/${dealId}/counterparts/${counterpart.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: counterpart.name,
            included: counterpart.included,
            details: counterpart.details,
          }),
        }
      )
      if (!response.ok) throw new Error('Erro ao salvar')
      await fetchCounterparts()
      setEditingId(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao salvar entregável')
    }
  }

  const handleDeleteCounterpart = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este entregável?')) return
    try {
      const response = await fetch(
        `/api/deals/${dealId}/counterparts/${id}`,
        { method: 'DELETE' }
      )
      if (!response.ok) throw new Error('Erro ao remover')
      await fetchCounterparts()
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao remover entregável')
    }
  }

  const handleAddCounterpart = async () => {
    if (!selectedCounterpartId) {
      alert('Por favor, selecione um entregável')
      return
    }
    try {
      const response = await fetch(
        `/api/deals/${dealId}/counterparts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            counterpart_id: selectedCounterpartId,
            name: newCounterpart.name,
            details: newCounterpart.details,
            included: newCounterpart.included,
            custom: false,
          }),
        }
      )
      if (!response.ok) throw new Error('Erro ao adicionar')
      await fetchCounterparts()
      setNewCounterpart({ counterpart_id: '', name: '', details: '', included: true })
      setSelectedCounterpartId('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao adicionar entregável')
    }
  }

  const handleCounterpartSelect = (counterpartId: string) => {
    setSelectedCounterpartId(counterpartId)
    const selected = availableCounterparts.find(cp => cp.id === counterpartId)
    if (selected) {
      setNewCounterpart({
        counterpart_id: counterpartId,
        name: selected.name,
        details: selected.details || '',
        included: true,
      })
    }
  }

  const handleImportFromTier = async () => {
    if (!selectedTierId) {
      alert('Por favor, selecione uma cota de patrocínio')
      return
    }
    setImporting(true)
    try {
      const response = await fetch(
        `/api/deals/${dealId}/counterparts/import-from-tier`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier_id: selectedTierId }),
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao importar entregáveis')
      }
      const result = await response.json()
      await fetchCounterparts()
      setShowImportForm(false)
      setSelectedTierId('')
      alert(result.message || `${result.added} entregável(is) adicionado(s) com sucesso`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao importar entregáveis')
    } finally {
      setImporting(false)
    }
  }

  const handleDeleteAllCounterparts = async () => {
    setDeletingAll(true)
    try {
      const response = await fetch(
        `/api/deals/${dealId}/counterparts`,
        { method: 'DELETE' }
      )
      if (!response.ok) throw new Error('Erro ao remover todos os entregáveis')
      await fetchCounterparts()
      setShowDeleteAllDialog(false)
      alert('Todos os entregáveis foram removidos com sucesso')
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao remover todos os entregáveis')
    } finally {
      setDeletingAll(false)
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Carregando entregáveis...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Entregáveis Negociados
          </h3>
          <p className="text-xs text-muted-foreground">
            Gerencie os entregáveis específicos desta negociação (tailor made)
          </p>
        </div>
        <div className="flex gap-2">
          {counterparts.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteAllDialog(true)}
            >
              🗑️ Deletar Todos
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowImportForm(!showImportForm)
              if (showImportForm) {
                setSelectedTierId('')
              }
              setShowAddForm(false)
            }}
          >
            {showImportForm ? 'Cancelar' : '📦 Inserir Pacote'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowAddForm(!showAddForm)
              if (showAddForm) {
                setNewCounterpart({ counterpart_id: '', name: '', details: '', included: true })
                setSelectedCounterpartId('')
              }
              setShowImportForm(false)
            }}
          >
            {showAddForm ? 'Cancelar' : '+ Adicionar'}
          </Button>
        </div>
      </div>

      {showImportForm && (
        <div className="p-4 border border-border rounded-lg space-y-3 bg-muted/50">
          <div>
            <Label htmlFor="tier_select">Selecione uma Cota de Patrocínio</Label>
            <Select
              value={selectedTierId}
              onValueChange={setSelectedTierId}
            >
              <SelectTrigger id="tier_select" className="mt-2">
                <SelectValue placeholder="Selecione uma cota..." />
              </SelectTrigger>
              <SelectContent>
                {tiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.name} - R$ {tier.value_brl.toLocaleString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Todos os entregáveis desta cota serão adicionados ao deal (duplicatas serão ignoradas)
            </p>
          </div>
          <Button 
            type="button" 
            onClick={handleImportFromTier} 
            size="sm"
            disabled={!selectedTierId || importing}
          >
            {importing ? 'Importando...' : 'Importar Entregáveis'}
          </Button>
        </div>
      )}

      {showAddForm && (
        <div className="p-4 border border-border rounded-lg space-y-3 bg-muted/50">
          <div>
            <Label htmlFor="counterpart_select">Selecione um Entregável *</Label>
            <Select
              value={selectedCounterpartId}
              onValueChange={handleCounterpartSelect}
            >
              <SelectTrigger id="counterpart_select" className="mt-2">
                <SelectValue placeholder="Selecione um entregável..." />
              </SelectTrigger>
              <SelectContent>
                {availableCounterparts
                  .filter(cp => !counterparts.some(dc => dc.counterpart_id === cp.id))
                  .map((counterpart) => (
                    <SelectItem key={counterpart.id} value={counterpart.id}>
                      {counterpart.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Selecione um entregável existente no banco de dados
            </p>
          </div>
          {selectedCounterpartId && (
            <>
              <div>
                <Label htmlFor="new_details">Detalhes/Explicação (opcional)</Label>
                <Textarea
                  id="new_details"
                  value={newCounterpart.details}
                  onChange={(e) => setNewCounterpart({ ...newCounterpart, details: e.target.value })}
                  placeholder="Detalhes específicos para esta negociação"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new_included"
                  checked={newCounterpart.included}
                  onChange={(e) => setNewCounterpart({ ...newCounterpart, included: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="new_included" className="cursor-pointer">
                  Incluído
                </Label>
              </div>
            </>
          )}
          <Button 
            type="button" 
            onClick={handleAddCounterpart} 
            size="sm"
            disabled={!selectedCounterpartId}
          >
            Adicionar
          </Button>
        </div>
      )}

      {counterparts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum entregável negociado ainda. Adicione um ou selecione uma cota para copiar automaticamente os entregáveis padrão.
        </p>
      ) : (
        <div className="space-y-3">
          {counterparts.map((counterpart) => (
            <div
              key={counterpart.id}
              className="p-4 border border-border rounded-lg space-y-3"
            >
              {editingId === counterpart.id ? (
                <>
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={counterpart.name}
                      onChange={(e) => {
                        const updated = counterparts.map((c) =>
                          c.id === counterpart.id ? { ...c, name: e.target.value } : c
                        )
                        setCounterparts(updated)
                      }}
                    />
                  </div>
                  <div>
                    <Label>Detalhes/Explicação</Label>
                    <Textarea
                      value={counterpart.details || ''}
                      onChange={(e) => {
                        const updated = counterparts.map((c) =>
                          c.id === counterpart.id ? { ...c, details: e.target.value } : c
                        )
                        setCounterparts(updated)
                      }}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={counterpart.included}
                      onChange={(e) => {
                        const updated = counterparts.map((c) =>
                          c.id === counterpart.id ? { ...c, included: e.target.checked } : c
                        )
                        setCounterparts(updated)
                      }}
                      className="rounded"
                    />
                    <Label className="cursor-pointer">Incluído</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveCounterpart(counterpart)}
                    >
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(null)
                        fetchCounterparts()
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{counterpart.name}</h4>
                        {counterpart.custom && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Custom
                          </span>
                        )}
                        {counterpart.included ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Incluído
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Não incluído
                          </span>
                        )}
                      </div>
                      {counterpart.details && (
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                          {counterpart.details}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(counterpart.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCounterpart(counterpart.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar todos os {counterparts.length} entregável(is)? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteAllDialog(false)}
              disabled={deletingAll}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAllCounterparts}
              disabled={deletingAll}
            >
              {deletingAll ? 'Deletando...' : 'Deletar Todos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}