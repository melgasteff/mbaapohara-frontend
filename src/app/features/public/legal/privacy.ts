import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Contacto para consultas y derechos sobre los datos (dato público elegido por la autora del proyecto). */
const CONTACT = 'melgasteff@gmail.com';

/**
 * Política de privacidad (tarea 1.9). Describe lo que el sistema hace hoy: datos mínimos (Ley 7593/2025),
 * borrado de la cuenta con sus reseñas (D9) y envío de solo el texto al modelo de lenguaje (D4).
 * BORRADOR: revisar con el tutor; los marcadores [entre corchetes] se completan en las tareas indicadas.
 * El proveedor del modelo se completó en la 2.3; el alojamiento y las copias de seguridad, en la 4.4.
 */
@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './legal.css',
  template: `
    <article class="page legal" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Política de privacidad</h1>
      <p class="meta body-sm"><span class="mb-tag">Borrador</span> Actualizada el 19 de noviembre de 2026</p>

      <div class="callout">
        <p class="body">
          Pedimos lo mínimo para que puedas publicar. <strong>Tu nombre nunca se muestra</strong> y quien modera no ve quién escribió
          cada reseña.
        </p>
      </div>

      <h2 class="h2">Quién es responsable</h2>
      <p>
        Mbaapohara es un Proyecto Final de Grado de la carrera de Ingeniería en Informática de la Facultad de Ciencias y
        Tecnologías de la Universidad Nacional de Caaguazú (FCyT-UNCA). Para consultas sobre tus datos escribinos a
        <a class="mb-link" [href]="'mailto:' + contact">{{ contact }}</a>.
      </p>

      <h2 class="h2">Qué datos guardamos</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Dato</th><th scope="col">Para qué</th></tr></thead>
          <tbody>
            <tr><td>Correo electrónico</td><td>Que puedas ingresar y que haya una sola reseña por persona y local</td></tr>
            <tr><td>Contraseña, guardada cifrada (nunca en texto legible)</td><td>Que solo vos puedas ingresar</td></tr>
            <tr><td>Rol y estado de la cuenta</td><td>Saber si es una cuenta común o de administración, y si está bloqueada</td></tr>
            <tr><td>Fecha en que aceptaste estos términos</td><td>Dejar constancia de tu consentimiento</td></tr>
            <tr><td>Tus reseñas: local, cargo, situación, último año, tipo de contrato, modalidad, respuestas, calificación y texto</td><td>Publicarlas y calcular indicadores sobre las empresas</td></tr>
          </tbody>
        </table>
      </div>
      <p><strong>No pedimos</strong> tu nombre, tu documento, tu teléfono, tu fecha de nacimiento ni tu dirección.</p>

      <h2 class="h2">Qué se muestra y qué no</h2>
      <ul>
        <li>Una reseña publicada muestra el cargo, la ciudad, si trabajás o trabajaste ahí y, si ya no, el último año.
          <strong>Nunca muestra quién la escribió</strong> ni fechas exactas.</li>
        <li>Los indicadores de una empresa se muestran solo cuando tiene <strong>3 reseñas o más</strong>, para que no se pueda
          deducir quién respondió.</li>
        <li>No usamos cookies de seguimiento ni herramientas de publicidad. Tu sesión se guarda en tu navegador mientras
          la pestaña está abierta.</li>
      </ul>

      <h2 class="h2">Con quién compartimos datos</h2>
      <ul>
        <li><strong>Moderación automática:</strong> el texto de la reseña («Lo bueno» y «A mejorar») se envía a un servicio de
          modelo de lenguaje para revisarlo (ver <a class="mb-link" routerLink="/como-moderamos">cómo moderamos</a>).
          <strong>Solo se envía el texto</strong>: nunca tu correo, tu cuenta, la empresa ni el local.
          Proveedor: Anthropic (modelo Claude), a través de su API.</li>
        <li><strong>Alojamiento:</strong> los datos se guardan en servidores de [se completa en la tarea 4.4].</li>
        <li>No vendemos ni cedemos tus datos a nadie, tampoco a las empresas reseñadas.</li>
      </ul>

      <h2 class="h2">Tus derechos</h2>
      <p>Con tu cuenta podés, en cualquier momento:</p>
      <ul>
        <li><strong>Ver</strong> tus datos.</li>
        <li><strong>Descargarlos</strong> en un archivo (exportar).</li>
        <li><strong>Eliminar tu cuenta.</strong> Se borran tu correo, tus datos y <strong>también tus reseñas</strong>, de forma
          definitiva.</li>
      </ul>
      <p>
        También podés escribirnos a <a class="mb-link" [href]="'mailto:' + contact">{{ contact }}</a> para corregir datos o
        hacer cualquier consulta. Estos derechos se basan en la Ley N.º 7593/2025 de protección de datos personales.
        [Revisar con el tutor la referencia legal y los plazos de respuesta.]
      </p>

      <h2 class="h2">Cuánto tiempo guardamos los datos</h2>
      <ul>
        <li>Mientras tu cuenta exista. Al eliminarla se borran en el momento.</li>
        <li>Las copias de seguridad: [se completa en la tarea 4.4].</li>
      </ul>

      <h2 class="h2">Cómo los protegemos</h2>
      <ul>
        <li>Las contraseñas se guardan cifradas y nunca se registran en ningún lado.</li>
        <li>Los registros técnicos del sistema no guardan contraseñas, tokens ni datos personales.</li>
        <li>El ingreso limita los intentos para frenar a quien quiera adivinar contraseñas.</li>
      </ul>

      <h2 class="h2">Edad</h2>
      <p>Para crear una cuenta tenés que tener 18 años o más. No pedimos tu fecha de nacimiento: lo declarás al registrarte.</p>

      <h2 class="h2">Cambios</h2>
      <p>Si cambiamos esta política, lo avisamos en esta página con la fecha de actualización.</p>

      <nav class="see-also" aria-label="Más información">
        <a class="mb-link" routerLink="/terminos">Términos de uso</a>
        <a class="mb-link" routerLink="/como-moderamos">Cómo moderamos</a>
      </nav>
    </article>
  `,
})
export class Privacy {
  protected readonly contact = CONTACT;
}
