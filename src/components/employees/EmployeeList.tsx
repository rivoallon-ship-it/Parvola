import React, { useRef, useState } from 'react';
import { Plus, Search, FileSpreadsheet, Users, Building2, Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Employee, NewEmployeeForm, Establishment, Team, NewEstablishmentForm, NewTeamForm } from '@/types';
import { Button, Input, EmptyState, Modal, Select } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeForm } from './EmployeeForm';
import { EstablishmentCard, EstablishmentForm, TeamForm } from '@/components/organization';
import { parseEmployeesFromExcel, downloadEmployeeTemplate } from '@/services/excel';
import { useNavigation, useEmployees, useOrganization, useTemplates, useUser, useConfirmDialog, useToast } from '@/hooks';
import { canEditEmployees, getEmployeesInScope } from '@/utils/permissions';
import { ConfirmDialog } from '@/components/common';

// ============================================
// Composant EmployeeList (Vue Équipe avec hiérarchie)
// ============================================

export const EmployeeList: React.FC = () => {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm, setSelectedEmployee, setCurrentView } = useNavigation();
  const { employees: allEmployees, addEmployee, updateEmployee, deleteEmployee, importEmployees } = useEmployees();
  const { establishments, teams, addEstablishment, updateEstablishment, deleteEstablishment, addTeam, updateTeam, deleteTeam } = useOrganization();
  const { positions } = useTemplates();
  const { currentUser } = useUser();

  const toast = useToast();
  const canEdit = canEditEmployees(currentUser.role);
  const employees = getEmployeesInScope(currentUser, allEmployees, teams);

  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [defaultEstablishmentIdForTeam, setDefaultEstablishmentIdForTeam] = useState<string>('');

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<'intro' | 'configure'>('intro');
  const [importEstablishmentId, setImportEstablishmentId] = useState<string>('');
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dialog, confirm, close } = useConfirmDialog();

  // Filtrage par recherche - bidirectionnel (haut vers bas ET bas vers haut)
  const matchesSearch = (text: string) =>
    !searchTerm || text.toLowerCase().includes(searchTerm.toLowerCase());

  // 1. D'abord, trouver tous les employés qui matchent directement
  const directMatchingEmployees = employees.filter(
    (e) => matchesSearch(e.name) || matchesSearch(e.position)
  );

  // 2. Trouver toutes les équipes qui matchent directement OU qui contiennent des employés matchants
  const directMatchingTeams = teams.filter(
    (t) => matchesSearch(t.name) || matchesSearch(t.description)
  );
  const teamsWithMatchingEmployees = teams.filter(
    (t) => directMatchingEmployees.some((e) => e.teamId === t.id)
  );
  const allMatchingTeamIds = new Set([
    ...directMatchingTeams.map((t) => t.id),
    ...teamsWithMatchingEmployees.map((t) => t.id),
  ]);

  // 3. Trouver tous les établissements qui matchent directement
  const directMatchingEstablishments = establishments.filter(
    (e) => matchesSearch(e.name) || matchesSearch(e.description)
  );
  const directMatchingEstablishmentIds = new Set(directMatchingEstablishments.map((e) => e.id));

  // 4. Trouver les établissements qui contiennent des équipes/employés matchants (pour affichage hiérarchique)
  const establishmentsWithMatchingTeams = establishments.filter(
    (e) => teams.some((t) => allMatchingTeamIds.has(t.id) && t.establishmentId === e.id)
  );
  const establishmentsWithMatchingEmployees = establishments.filter(
    (e) => directMatchingEmployees.some((emp) => emp.establishmentId === e.id && !emp.teamId)
  );
  const allMatchingEstablishmentIds = new Set([
    ...directMatchingEstablishmentIds,
    ...establishmentsWithMatchingTeams.map((e) => e.id),
    ...establishmentsWithMatchingEmployees.map((e) => e.id),
  ]);

  // 5. Filtrer les collections finales
  const filteredEstablishments = establishments.filter((e) =>
    allMatchingEstablishmentIds.has(e.id)
  );

  // Équipes: inclure si match direct, contient employé matchant, OU appartient à un établissement qui match directement
  const filteredTeams = teams.filter(
    (t) =>
      allMatchingTeamIds.has(t.id) ||
      directMatchingEstablishmentIds.has(t.establishmentId)
  );

  // Employés: inclure si match direct, OU appartient à une équipe/établissement qui match directement
  const filteredEmployees = employees.filter(
    (e) =>
      matchesSearch(e.name) ||
      matchesSearch(e.position) ||
      (e.teamId && directMatchingTeams.some((t) => t.id === e.teamId)) ||
      (e.establishmentId && directMatchingEstablishmentIds.has(e.establishmentId))
  );

  // Employés sans établissement (complètement non assignés)
  const unassignedEmployees = filteredEmployees.filter((e) => !e.establishmentId);

  // ========== Handlers Import ==========
  const handleOpenImportModal = () => {
    setImportStep('intro');
    setPendingImportFile(null);
    setImportEstablishmentId(establishments[0]?.id || '');
    setShowImportModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPendingImportFile(file);
    setImportEstablishmentId(establishments[0]?.id || '');
    setImportStep('configure');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingImportFile || !importEstablishmentId) return;

    try {
      const imported = await parseEmployeesFromExcel(pendingImportFile);
      if (imported.length > 0) {
        await importEmployees(imported, importEstablishmentId);
        toast.success(t('toast.importSuccess', { count: imported.length }));
      } else {
        toast.warning(t('toast.noEmployeesInFile'));
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(t('toast.importError'));
    }

    setShowImportModal(false);
    setImportStep('intro');
    setPendingImportFile(null);
    setImportEstablishmentId('');
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setImportStep('intro');
    setPendingImportFile(null);
    setImportEstablishmentId('');
  };

  // ========== Handlers Employee ==========
  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee({ ...emp });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddEmployee = async (data: NewEmployeeForm) => {
    await addEmployee(data);
    setShowAddEmployeeForm(false);
    toast.success(t('toast.employeeAdded'));
  };

  const handleUpdateEmployee = async (data: Employee) => {
    await updateEmployee(data);
    setEditingEmployee(null);
    toast.success(t('toast.employeeUpdated'));
  };

  const handleDeleteEmployee = (id: string) => {
    confirm(t('employees.deleteConfirm'), async () => {
      await deleteEmployee(id);
      setEditingEmployee(null);
      close();
      toast.success(t('toast.employeeDeleted'));
    });
  };

  const handleViewEvaluations = (employee: Employee) => {
    setSelectedEmployee(employee);
    setCurrentView('evaluation');
  };

  // ========== Handler Drag & Drop ==========
  const handleDropEmployee = async (employeeId: string, establishmentId: string, teamId?: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;

    await updateEmployee({
      ...employee,
      establishmentId,
      teamId,
    });
  };

  // ========== Handlers Establishment ==========
  const handleAddEstablishment = async (data: NewEstablishmentForm) => {
    await addEstablishment(data);
    setShowEstablishmentModal(false);
    toast.success(t('toast.establishmentAdded'));
  };

  const handleUpdateEstablishment = async (data: Establishment) => {
    await updateEstablishment(data);
    setEditingEstablishment(null);
    toast.success(t('toast.establishmentUpdated'));
  };

  const handleDeleteEstablishment = (id: string) => {
    confirm(
      t('organization.deleteEstablishmentConfirm'),
      async () => {
        await deleteEstablishment(id);
        setEditingEstablishment(null);
        close();
        toast.success(t('toast.establishmentDeleted'));
      }
    );
  };

  // ========== Handlers Team ==========
  const handleOpenAddTeamModal = (establishmentId?: string) => {
    setDefaultEstablishmentIdForTeam(establishmentId || '');
    setShowTeamModal(true);
  };

  const handleAddTeam = async (data: NewTeamForm) => {
    await addTeam(data);
    setShowTeamModal(false);
    setDefaultEstablishmentIdForTeam('');
    toast.success(t('toast.teamAdded'));
  };

  const handleUpdateTeam = async (data: Team) => {
    await updateTeam(data);
    setEditingTeam(null);
    toast.success(t('toast.teamUpdated'));
  };

  const handleDeleteTeam = (id: string) => {
    confirm(
      t('organization.deleteTeamConfirm'),
      async () => {
        await deleteTeam(id);
        setEditingTeam(null);
        close();
        toast.success(t('toast.teamDeleted'));
      }
    );
  };

  // Options pour la sélection d'établissement
  const establishmentOptions = establishments.map((est) => ({
    value: est.id,
    label: est.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.title')}
        action={
          canEdit ? (
            <div className="flex gap-3 items-center flex-wrap">
              <Button
                variant="secondary"
                icon={<Building2 size={20} />}
                onClick={() => setShowEstablishmentModal(true)}
              >
                {t('employees.newEstablishment')}
              </Button>
              <Button
                variant="secondary"
                icon={<FileSpreadsheet size={20} />}
                onClick={handleOpenImportModal}
              >
                {t('employees.importFromExcel')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Button
                variant="primary"
                icon={<Plus size={20} />}
                onClick={() => setShowAddEmployeeForm(true)}
              >
                {t('employees.new')}
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Read-only notice for managers */}
      {!canEdit && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-blue-50 border-blue-200">
          <span className="text-sm font-medium text-blue-700">{t('manager.readOnlyTeam')}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={20} />}
        />
      </div>

      {/* Add Employee Form */}
      {showAddEmployeeForm && canEdit && (
        <EmployeeForm
          teams={teams}
          establishments={establishments}
          positions={positions}
          onSubmit={handleAddEmployee as (data: NewEmployeeForm | Employee) => void}
          onCancel={() => setShowAddEmployeeForm(false)}
        />
      )}

      {/* Edit Employee Form */}
      {editingEmployee && (
        <EmployeeForm
          employee={editingEmployee}
          teams={teams}
          establishments={establishments}
          positions={positions}
          onSubmit={handleUpdateEmployee as (data: NewEmployeeForm | Employee) => void}
          onCancel={() => setEditingEmployee(null)}
          onDelete={() => handleDeleteEmployee(editingEmployee.id)}
          isEditing
        />
      )}

      {/* Establishments hierarchy */}
      {filteredEstablishments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">{t('employees.organization')}</h2>
          {filteredEstablishments.map((establishment) => (
            <EstablishmentCard
              key={establishment.id}
              establishment={establishment}
              teams={filteredTeams}
              employees={filteredEmployees}
              onEdit={canEdit ? () => setEditingEstablishment(establishment) : undefined}
              onAddTeam={canEdit ? () => handleOpenAddTeamModal(establishment.id) : undefined}
              onEditTeam={canEdit ? (team) => setEditingTeam(team) : undefined}
              onEditEmployee={canEdit ? handleEditEmployee : undefined}
              onViewEmployeeEvaluations={handleViewEvaluations}
              onDropEmployee={canEdit ? handleDropEmployee : undefined}
            />
          ))}
        </div>
      )}

      {/* Unassigned Employees */}
      {unassignedEmployees.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            {t('employees.unassigned')} ({unassignedEmployees.length})
          </h2>
          <p className="text-sm text-gray-500">
            {t('employees.dragHint')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedEmployees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onEdit={canEdit ? () => handleEditEmployee(emp) : undefined}
                onViewEvaluations={() => handleViewEvaluations(emp)}
                draggable={canEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEstablishments.length === 0 &&
        unassignedEmployees.length === 0 &&
        !showAddEmployeeForm && (
          <EmptyState
            icon={Users}
            message={t('employees.emptyState')}
          />
        )}

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={handleCancelImport}
        title={t('employees.importTitle')}
      >
        {importStep === 'intro' ? (
          <div className="space-y-4">
            <p className="text-gray-600">{t('employees.importIntro')}</p>

            {/* Format guide */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t('employees.importFormatTitle')}
              </p>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">{t('employees.importColumn')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('employees.importContent')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('employees.importExample')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-3 py-2 font-mono text-gray-400">A</td>
                      <td className="px-3 py-2 text-gray-700">{t('employees.importColFirstName')}</td>
                      <td className="px-3 py-2 text-gray-500">Sophie</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-gray-400">B</td>
                      <td className="px-3 py-2 text-gray-700">{t('employees.importColLastName')}</td>
                      <td className="px-3 py-2 text-gray-500">Laurent</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-gray-400">C</td>
                      <td className="px-3 py-2 text-gray-700">{t('employees.importColPositionOptional')}</td>
                      <td className="px-3 py-2 text-gray-500">Cheffe de cuisine</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-500">{t('employees.importTip')}</p>
            </div>

            {establishments.length === 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-800 text-sm">
                {t('employees.importNoEstablishment')}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="secondary" icon={<Download size={18} />} onClick={downloadEmployeeTemplate}>
                {t('employees.downloadTemplate')}
              </Button>
              <Button
                variant="primary"
                icon={<Upload size={18} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={establishments.length === 0}
              >
                {t('employees.chooseFile')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              {t('employees.importSelectedFile')} : <strong>{pendingImportFile?.name}</strong>
            </p>
            <p className="text-sm text-gray-500">{t('employees.importDescription')}</p>
            <Select
              label={t('employees.importDestination')}
              value={importEstablishmentId}
              onChange={(e) => setImportEstablishmentId(e.target.value)}
              options={establishmentOptions}
              required
            />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" onClick={handleConfirmImport} disabled={!importEstablishmentId}>
                {t('common.import')}
              </Button>
              <Button variant="secondary" onClick={() => setImportStep('intro')}>
                {t('employees.importBack')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Establishment Modal - Add */}
      <Modal
        isOpen={showEstablishmentModal}
        onClose={() => setShowEstablishmentModal(false)}
        title={t('organization.newEstablishment')}
      >
        <EstablishmentForm
          onSubmit={handleAddEstablishment as (data: NewEstablishmentForm | Establishment) => void}
          onCancel={() => setShowEstablishmentModal(false)}
        />
      </Modal>

      {/* Establishment Modal - Edit */}
      <Modal
        isOpen={!!editingEstablishment}
        onClose={() => setEditingEstablishment(null)}
        title={t('organization.editEstablishment')}
      >
        {editingEstablishment && (
          <EstablishmentForm
            establishment={editingEstablishment}
            onSubmit={handleUpdateEstablishment as (data: NewEstablishmentForm | Establishment) => void}
            onCancel={() => setEditingEstablishment(null)}
            onDelete={() => handleDeleteEstablishment(editingEstablishment.id)}
            isEditing
          />
        )}
      </Modal>

      {/* Team Modal - Add */}
      <Modal
        isOpen={showTeamModal}
        onClose={() => {
          setShowTeamModal(false);
          setDefaultEstablishmentIdForTeam('');
        }}
        title={t('organization.newTeam')}
      >
        <TeamForm
          establishments={establishments}
          defaultEstablishmentId={defaultEstablishmentIdForTeam}
          onSubmit={handleAddTeam as (data: NewTeamForm | Team) => void}
          onCancel={() => {
            setShowTeamModal(false);
            setDefaultEstablishmentIdForTeam('');
          }}
        />
      </Modal>

      {/* Team Modal - Edit */}
      <Modal
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        title={t('organization.editTeam')}
      >
        {editingTeam && (
          <TeamForm
            team={editingTeam}
            establishments={establishments}
            onSubmit={handleUpdateTeam as (data: NewTeamForm | Team) => void}
            onCancel={() => setEditingTeam(null)}
            onDelete={() => handleDeleteTeam(editingTeam.id)}
            isEditing
          />
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialog.show}
        message={dialog.message}
        onConfirm={() => dialog.onConfirm?.()}
        onCancel={close}
      />
    </div>
  );
};

export default EmployeeList;
