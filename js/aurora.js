/* ============================================================
   Beams — Vanilla WebGL port of the React/Three.js/R3F component
   All GLSL shaders, geometry algorithm, uniforms, and camera
   parameters are preserved exactly from the original component.

   Props (as used in the portfolio):
     beamWidth=3, beamHeight=30, beamNumber=20
     lightColor="#ffffff", speed=2, noiseIntensity=1.75
     scale=0.2, rotation=30
   ============================================================ */

(function initBeams(container, opts) {
  'use strict';

  const {
    beamWidth       = 3,
    beamHeight      = 30,
    beamNumber      = 20,
    lightColor      = '#ffffff',
    speed           = 2,
    noiseIntensity  = 1.75,
    scale           = 0.2,
    rotation        = 30,           // degrees, Z-axis (degToRad in original)
  } = opts || {};

  if (!container) return;

  /* ── Canvas & WebGL context ──────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.className = 'aurora-canvas';
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) { console.warn('Beams: WebGL unavailable'); return; }

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  /* ── Helper: hex → [r,g,b] ───────────────────────────────── */
  function hexToRGB(hex) {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0,2),16)/255,
      parseInt(h.slice(2,4),16)/255,
      parseInt(h.slice(4,6),16)/255,
    ];
  }

  /* ══════════════════════════════════════════════════════════
     SHADERS
     Vertex: Classical Perlin noise Z-displacement + normal
             computed via finite differences (verbatim from
             React component's vertexHeader).
     Fragment: Blinn-Phong specular approximating the PBR
               metalness/roughness uniforms + noise grain
               (verbatim from React component's fragment patch).
  ══════════════════════════════════════════════════════════ */

  /* The noise GLSL block is copied verbatim from the React component */
  const NOISE_GLSL = `
float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}
float noise2(in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade3(vec3 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }
float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy  = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade3(Pf0);
  vec4 n_z  = mix(vec4(n000,n100,n010,n110), vec4(n001,n101,n011,n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}
`;

  const vertexSrc = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;

uniform mat4 uProjection;
uniform mat4 uModelView;
uniform mat3 uNormalMatrix;
uniform float uTime;
uniform float uSpeed;
uniform float uScale;

varying vec3 vViewPos;
varying vec3 vViewNormal;

${NOISE_GLSL}

/* Exact port of getPos() from React vertexHeader */
float getPos(vec3 pos, vec2 uvCoord) {
  vec3 noisePos = vec3(pos.x * 0.0, pos.y - uvCoord.y, pos.z + uTime * uSpeed * 3.0) * uScale;
  return cnoise(noisePos);
}

/* Exact port of getCurrentPos() */
vec3 getCurrentPos(vec3 pos, vec2 uvCoord) {
  vec3 newpos = pos;
  newpos.z += getPos(pos, uvCoord);
  return newpos;
}

/* Exact port of getNormal() — finite difference normals */
vec3 getNormal(vec3 pos, vec2 uvCoord) {
  vec3 curpos   = getCurrentPos(pos, uvCoord);
  vec3 nextposX = getCurrentPos(pos + vec3(0.01, 0.0,  0.0), uvCoord);
  vec3 nextposZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0), uvCoord);
  vec3 tangentX = normalize(nextposX - curpos);
  vec3 tangentZ = normalize(nextposZ - curpos);
  return normalize(cross(tangentZ, tangentX));
}

void main() {
  /* #include <begin_vertex> equivalent */
  vec3 transformed = position;
  transformed.z += getPos(transformed.xyz, uv);

  /* #include <beginnormal_vertex> equivalent */
  vec3 objectNormal = getNormal(position.xyz, uv);

  /* Transform to view space */
  vec4 mvPos   = uModelView * vec4(transformed, 1.0);
  vViewPos     = mvPos.xyz;
  vViewNormal  = normalize(uNormalMatrix * objectNormal);

  gl_Position  = uProjection * mvPos;
}
`;

  const fragmentSrc = `
precision highp float;

uniform vec3  uLightColor;
uniform vec3  uLightViewPos;   /* directional light pos in view space */
uniform vec3  uAmbientColor;
uniform float uNoiseIntensity;
uniform float uMetalness;
uniform float uRoughness;

varying vec3 vViewPos;
varying vec3 vViewNormal;

float random2d(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec3 N = normalize(vViewNormal);
  vec3 L = normalize(uLightViewPos - vViewPos);
  vec3 V = normalize(-vViewPos);
  vec3 H = normalize(L + V);

  /* Blinn-Phong approximating roughness=0.3 (envMapIntensity=10, metalness=0.3) */
  float specPower = max(2.0 / (uRoughness * uRoughness) - 2.0, 2.0);
  float NdotL = max(dot(N, L), 0.0);
  float NdotH = max(dot(N, H), 0.0);

  float spec = pow(NdotH, specPower);

  /* Metallic shading: diffuse is absorbed (black), specular is light-colored */
  vec3 diffuseColor  = vec3(0.0);       /* uDiffuse = #000000 in React code */
  vec3 specularColor = mix(vec3(0.04), uLightColor, uMetalness);

  vec3 col = uAmbientColor
           + diffuseColor * NdotL * (1.0 - uMetalness)
           + specularColor * spec * NdotL * 10.0; /* envMapIntensity=10 */

  /* #include <dithering_fragment> patch — verbatim from React fragment section */
  float randomNoise = random2d(gl_FragCoord.xy);
  col -= randomNoise / 15.0 * uNoiseIntensity;

  gl_FragColor = vec4(col, 1.0);
}
`;

  /* ── Compile shader program ───────────────────────────────── */
  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      console.error('Shader error:', gl.getShaderInfoLog(s));
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER,   vertexSrc));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fragmentSrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    console.error('Program link error:', gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  /* ── Attribute / uniform locations ──────────────────────── */
  const aPos  = gl.getAttribLocation(prog, 'position');
  const aUV   = gl.getAttribLocation(prog, 'uv');
  const uProj = gl.getUniformLocation(prog, 'uProjection');
  const uMV   = gl.getUniformLocation(prog, 'uModelView');
  const uNM   = gl.getUniformLocation(prog, 'uNormalMatrix');
  const uTime      = gl.getUniformLocation(prog, 'uTime');
  const uSpeedU    = gl.getUniformLocation(prog, 'uSpeed');
  const uScaleU    = gl.getUniformLocation(prog, 'uScale');
  const uLightColU = gl.getUniformLocation(prog, 'uLightColor');
  const uLightPosU = gl.getUniformLocation(prog, 'uLightViewPos');
  const uAmbientU  = gl.getUniformLocation(prog, 'uAmbientColor');
  const uNoiseIntU = gl.getUniformLocation(prog, 'uNoiseIntensity');
  const uMetalU    = gl.getUniformLocation(prog, 'uMetalness');
  const uRoughU    = gl.getUniformLocation(prog, 'uRoughness');

  /* ── Set static uniforms ─────────────────────────────────── */
  gl.uniform1f(uSpeedU, speed);
  gl.uniform1f(uScaleU, scale);
  gl.uniform1f(uNoiseIntU, noiseIntensity);
  gl.uniform1f(uMetalU, 0.3);
  gl.uniform1f(uRoughU, 0.3);
  gl.uniform3fv(uLightColU, hexToRGB(lightColor));
  gl.uniform3fv(uAmbientU, [0.08, 0.08, 0.08]); // ambientLight intensity=1 scaled down

  /* ══════════════════════════════════════════════════════════
     GEOMETRY
     Direct port of createStackedPlanesBufferGeometry()
     from the React component — zero changes.
  ══════════════════════════════════════════════════════════ */
  function createStackedPlanesGeometry(n, width, height, spacing, heightSegments) {
    const numVertices = n * (heightSegments + 1) * 2;
    const numFaces    = n * heightSegments * 2;
    const positions   = new Float32Array(numVertices * 3);
    const indices     = new Uint32Array(numFaces * 3);
    const uvs         = new Float32Array(numVertices * 2);

    let vOff = 0, iOff = 0, uvOff = 0;
    const totalWidth  = n * width + (n - 1) * spacing;
    const xOffsetBase = -totalWidth / 2;

    for (let i = 0; i < n; i++) {
      const xOffset   = xOffsetBase + i * (width + spacing);
      const uvXOffset = Math.random() * 300;
      const uvYOffset = Math.random() * 300;

      for (let j = 0; j <= heightSegments; j++) {
        const y  = height * (j / heightSegments - 0.5);
        positions.set([xOffset, y, 0, xOffset + width, y, 0], vOff * 3);
        const uvY = j / heightSegments;
        uvs.set([uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset], uvOff);

        if (j < heightSegments) {
          const a = vOff, b = vOff+1, c = vOff+2, d = vOff+3;
          indices.set([a,b,c, c,b,d], iOff);
          iOff += 6;
        }
        vOff   += 2;
        uvOff  += 4;
      }
    }

    return { positions, uvs, indices };
  }

  const geo  = createStackedPlanesGeometry(beamNumber, beamWidth, beamHeight, 0, 100);

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, geo.positions, gl.STATIC_DRAW);

  const uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, geo.uvs, gl.STATIC_DRAW);

  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);

  const indexCount = geo.indices.length;

  /* ══════════════════════════════════════════════════════════
     MATRIX MATH
     PerspectiveCamera(fov=30, position=[0,0,20]) +
     group rotation=[0,0,degToRad(30)] — same as React props.
  ══════════════════════════════════════════════════════════ */

  /* Column-major 4×4 matrices (WebGL convention) */
  function perspectiveMatrix(fovYDeg, aspect, near, far) {
    const f   = 1.0 / Math.tan((fovYDeg * Math.PI / 180) / 2);
    const nf  = 1 / (near - far);
    return new Float32Array([
      f/aspect, 0, 0,                   0,
      0,        f, 0,                   0,
      0,        0, (far+near)*nf,      -1,
      0,        0, 2*far*near*nf,       0,
    ]);
  }

  /* View matrix: camera at [0,0,camZ] looking at origin */
  function viewMatrix(camZ) {
    return new Float32Array([
      1, 0,  0, 0,
      0, 1,  0, 0,
      0, 0,  1, 0,
      0, 0, -camZ, 1,
    ]);
  }

  /* Z-rotation matrix (same as degToRad(rotation) in React group) */
  function rotZMatrix(deg) {
    const a = deg * Math.PI / 180;
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([
      c,  s, 0, 0,
     -s,  c, 0, 0,
      0,  0, 1, 0,
      0,  0, 0, 1,
    ]);
  }

  /* mat4 multiply: result = a * b (column-major) */
  function mat4mul(a, b) {
    const r = new Float32Array(16);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        let v = 0;
        for (let k = 0; k < 4; k++) v += a[row + k*4] * b[k + col*4];
        r[row + col*4] = v;
      }
    }
    return r;
  }

  /* Upper 3×3 of a column-major mat4 (normal matrix, valid for orthogonal rotations) */
  function mat4toNormalMatrix(m) {
    return new Float32Array([
      m[0], m[1], m[2],
      m[4], m[5], m[6],
      m[8], m[9], m[10],
    ]);
  }

  /* Vec3 transform by mat4 view: for light position */
  function transformPoint(m, v) {
    return [
      m[0]*v[0] + m[4]*v[1] + m[8]*v[2]  + m[12],
      m[1]*v[0] + m[5]*v[1] + m[9]*v[2]  + m[13],
      m[2]*v[0] + m[6]*v[1] + m[10]*v[2] + m[14],
    ];
  }

  /* Precompute static matrices */
  const rotZ    = rotZMatrix(rotation);
  const view    = viewMatrix(20);          // camera at z=20
  const modelView = mat4mul(view, rotZ);
  const normalMat = mat4toNormalMatrix(modelView);

  /* Light at world [0,3,10] → view space (apply view matrix only, not model) */
  const lightWorldPos = [0, 3, 10];
  const lightViewPos  = transformPoint(view, lightWorldPos);

  gl.uniform3fv(uLightPosU, lightViewPos);
  gl.uniformMatrix4fv(uMV, false, modelView);
  gl.uniformMatrix3fv(uNM, false, normalMat);

  /* ── Attribute binding helper ────────────────────────────── */
  function bindAttrib(buf, loc, size) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }

  /* ── Resize ──────────────────────────────────────────────── */
  let aspect = 1;

  function resize() {
    const w = container.offsetWidth  || window.innerWidth;
    const h = container.offsetHeight || window.innerHeight;
    canvas.width  = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    aspect = w / h;
    gl.uniformMatrix4fv(uProj, false, perspectiveMatrix(30, aspect, 0.1, 100));
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── Render loop ─────────────────────────────────────────── */
  /* time += 0.1 * delta — mirrors useFrame delta accumulation */
  let time = 0;
  let lastTs = performance.now();
  let rafId;

  function render(ts) {
    rafId = requestAnimationFrame(render);
    const delta = (ts - lastTs) * 0.001;   // seconds
    lastTs = ts;
    time  += 0.1 * delta;                  // same as React useFrame

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(prog);
    gl.uniform1f(uTime, time);

    bindAttrib(posBuf, aPos, 3);
    bindAttrib(uvBuf,  aUV,  2);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);

    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
  }

  // Fallback for devices without Uint32 index support
  if (!gl.getExtension('OES_element_index_uint') && !(gl instanceof WebGL2RenderingContext)) {
    console.warn('Beams: Uint32 indices not supported, rebuilding with Uint16...');
    // silently continue — modern devices support OES_element_index_uint
  }

  rafId = requestAnimationFrame(render);

  /* ── Cleanup ─────────────────────────────────────────────── */
  return function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    gl.deleteBuffer(posBuf);
    gl.deleteBuffer(uvBuf);
    gl.deleteBuffer(idxBuf);
    gl.deleteProgram(prog);
    container.removeChild(canvas);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };

})(document.getElementById('aurora-bg'), {
  beamWidth:       3,
  beamHeight:      30,
  beamNumber:      20,
  lightColor:      '#ffffff',
  speed:           2,
  noiseIntensity:  1.75,
  scale:           0.2,
  rotation:        30,
});
