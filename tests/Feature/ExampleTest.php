<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_root_redirects_to_dashboard_and_guests_redirect_to_login(): void
    {
        $this->get('/')->assertRedirect('/dashboard');
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_user_can_register_and_login_with_local_domain_email(): void
    {
        $supervisor = User::create([
            'name'              => 'Supervisor Uji',
            'email'             => 'supervisor.reg@kampus.local',
            'identifier_number' => '1980010188',
            'role'              => 'supervisor',
            'password'          => Hash::make('Password123'),
        ]);

        $response = $this->post('/register', [
            'name'                  => 'Mahasiswa Uji',
            'email'                 => 'mahasiswa.uji@kampus.local',
            'identifier_number'     => 'J120269901',
            'role'                  => 'mahasiswa',
            'supervisor_id'         => $supervisor->id,
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }

    public function test_patient_creation_rm_generation_and_tenant_authorization(): void
    {
        $supervisor = User::create([
            'name'              => 'Supervisor Klinis',
            'email'             => 'supervisor.uji@kampus.local',
            'identifier_number' => '1980010199',
            'role'              => 'supervisor',
            'password'          => Hash::make('Password123'),
        ]);

        $studentA = User::create([
            'name'              => 'Mahasiswa A',
            'email'             => 'student.a@kampus.local',
            'identifier_number' => 'J120269902',
            'role'              => 'mahasiswa',
            'supervisor_id'     => $supervisor->id,
            'password'          => Hash::make('Password123'),
        ]);

        $studentB = User::create([
            'name'              => 'Mahasiswa B',
            'email'             => 'student.b@kampus.local',
            'identifier_number' => 'J120269903',
            'role'              => 'mahasiswa',
            'password'          => Hash::make('Password123'),
        ]);

        // Student A generates RM and creates a patient
        $rmResponse = $this->actingAs($studentA)->getJson('/api/patients/generate-rm');
        $rmResponse->assertOk()->assertJsonStructure(['no_rm']);
        $generatedRm = $rmResponse->json('no_rm');

        $createResponse = $this->actingAs($studentA)->post('/patients', [
            'no_rm'             => $generatedRm,
            'name'              => 'Tn. Budi Santoso',
            'age'               => 45,
            'gender'            => 'Laki-Laki',
            'occupation'        => 'Pegawai Swasta',
            'medical_diagnosis' => 'Frozen Shoulder Dextra',
        ]);

        $patient = Patient::where('no_rm', $generatedRm)->firstOrFail();
        $createResponse->assertRedirect('/patients');
        $this->assertSame($studentA->id, $patient->user_id);

        // Next RM increments by 1
        $this->actingAs($studentA)
            ->getJson('/api/patients/generate-rm')
            ->assertOk()
            ->assertJson(['no_rm' => (string) (((int) $generatedRm) + 1)]);

        // Baik Mahasiswa A, Mahasiswa B, maupun Supervisor memiliki hak akses yang sama ke data pasien
        $this->actingAs($studentA)->get("/patients/{$patient->id}")->assertOk();
        $this->actingAs($studentB)->get("/patients/{$patient->id}")->assertOk();
        $this->actingAs($supervisor)->get("/patients/{$patient->id}")->assertOk();

        // Mahasiswa dapat menyimpan sesi evaluasi berkala
        $this->actingAs($studentA)->post('/progress-tracking', [
            'patient_id'      => $patient->id,
            'session_name'    => 'T1',
            'evaluation_date' => '2026-09-15',
            'pain_nrs'        => ['diam' => 2, 'tekan' => 4, 'gerak' => 6],
        ])->assertRedirect();

        $this->assertDatabaseHas('progress_evaluations', [
            'patient_id'   => $patient->id,
            'session_name' => 'T1',
        ]);
    }

    public function test_security_controls_for_supervisor_binding_shared_patients_and_date_validation(): void
    {
        $supervisor = User::create([
            'name'              => 'Supervisor Keamanan',
            'email'             => 'supervisor.sec@kampus.local',
            'identifier_number' => '1980010991',
            'role'              => 'supervisor',
            'password'          => Hash::make('Password123'),
        ]);

        $studentPeer = User::create([
            'name'              => 'Mahasiswa Peer',
            'email'             => 'peer.sec@kampus.local',
            'identifier_number' => 'J120269911',
            'role'              => 'mahasiswa',
            'supervisor_id'     => $supervisor->id,
            'password'          => Hash::make('Password123'),
        ]);

        // 1. Registrasi mahasiswa gagal jika supervisor_id merujuk ke akun ber-role mahasiswa
        $invalidReg = $this->post('/register', [
            'name'                  => 'Mahasiswa Baru',
            'email'                 => 'baru.sec@kampus.local',
            'identifier_number'     => 'J120269912',
            'role'                  => 'mahasiswa',
            'supervisor_id'         => $studentPeer->id,
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
        ]);
        $invalidReg->assertSessionHasErrors(['supervisor_id']);

        // 2. Pasien tanpa user_id maupun dengan user_id dapat diakses bersama oleh Supervisor dan Mahasiswa
        $sharedPatient = Patient::create([
            'user_id'           => null,
            'no_rm'             => '99991',
            'name'              => 'Pasien Bersama',
            'age'               => 30,
            'gender'            => 'Perempuan',
            'occupation'        => 'Swasta',
            'medical_diagnosis' => 'Low Back Pain',
        ]);

        $this->actingAs($supervisor)->get("/patients/{$sharedPatient->id}")->assertOk();
        $this->actingAs($studentPeer)->get("/patients/{$sharedPatient->id}")->assertOk();

        // 3. Input evaluation_date tidak valid ditolak dengan error validasi (bukan 500 Carbon exception)
        $badDateResponse = $this->actingAs($studentPeer)->post('/progress-tracking', [
            'patient_id'      => $sharedPatient->id,
            'session_name'    => 'T1',
            'evaluation_date' => 'bukan-tanggal-valid',
            'pain_nrs'        => ['diam' => 1, 'tekan' => 2, 'gerak' => 3],
        ]);
        $badDateResponse->assertSessionHasErrors(['evaluation_date']);
    }
}
